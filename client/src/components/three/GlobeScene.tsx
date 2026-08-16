'use client';

import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import type { Country } from '@/types/spatial';

/* ─── Helpers & Real-Time Solar Calculations ─────────────── */

/** Converts Latitude / Longitude to 3D Sphere coordinates matching Three.js SphereGeometry UV mapping */
const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
};

/** Calculate exact astronomical Sun direction in Earth World Space from current UTC clock time */
const calculateSunPosition = (date: Date = new Date(), radius: number = 300): THREE.Vector3 => {
    const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const sunLng = -((utcHours - 12) * 15);
    
    const startOfYear = new Date(date.getFullYear(), 0, 0).getTime();
    const dayOfYear = Math.floor((date.getTime() - startOfYear) / 86400000);
    const sunLat = 23.44 * Math.sin(((dayOfYear - 80) / 365) * 2 * Math.PI);

    return latLngToVector3(sunLat, sunLng, radius);
};

/* ─── Country Borders Line Layer (Balanced In-Between) ───── */

const WorldCountryBorders = () => {
    const [bordersGeo, setBordersGeo] = useState<THREE.BufferGeometry | null>(null);

    useEffect(() => {
        let isMounted = true;

        fetch('/data/world_borders.json')
            .then((res) => res.json())
            .then((data) => {
                if (!isMounted || !data.features) return;

                const points: number[] = [];

                const processRing = (ring: number[][]) => {
                    for (let i = 0; i < ring.length - 1; i++) {
                        const p1 = ring[i];
                        const p2 = ring[i + 1];

                        const v1 = latLngToVector3(p1[1], p1[0], 100.2);
                        const v2 = latLngToVector3(p2[1], p2[0], 100.2);

                        points.push(v1.x, v1.y, v1.z);
                        points.push(v2.x, v2.y, v2.z);
                    }
                };

                for (const feature of data.features) {
                    const geom = feature.geometry;
                    if (!geom) continue;

                    if (geom.type === 'Polygon') {
                        for (const ring of geom.coordinates) {
                            processRing(ring);
                        }
                    } else if (geom.type === 'MultiPolygon') {
                        for (const polygon of geom.coordinates) {
                            for (const ring of polygon) {
                                processRing(ring);
                            }
                        }
                    }
                }

                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute(
                    'position',
                    new THREE.Float32BufferAttribute(points, 3)
                );
                setBordersGeo(geometry);
            })
            .catch((err) => console.error('Error loading world borders GeoJSON:', err));

        return () => {
            isMounted = false;
        };
    }, []);

    if (!bordersGeo) return null;

    return (
        <lineSegments geometry={bordersGeo}>
            <lineBasicMaterial
                color="#0284c7"
                transparent
                opacity={0.6}
                depthWrite={false}
            />
        </lineSegments>
    );
};

/* ─── Custom Real-Time Day/Night Earth Shader ────────────── */

const EarthDayNightShader = {
    uniforms: {
        dayTexture: { value: null },
        nightTexture: { value: null },
        bumpTexture: { value: null },
        sunDirection: { value: new THREE.Vector3(0, 0, 1) },
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
            vUv = uv;
            vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;

        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
            vec3 worldNorm = normalize(vWorldNormal);
            vec3 sunNorm = normalize(sunDirection);
            
            float sunDot = dot(worldNorm, sunNorm);
            float dayFactor = smoothstep(-0.15, 0.25, sunDot);
            
            vec4 dayColor = texture2D(dayTexture, vUv);
            vec4 nightColor = texture2D(nightTexture, vUv);
            
            dayColor.rgb *= 1.45;
            nightColor.rgb *= vec3(1.5, 1.25, 0.9) * 2.2;
            
            vec3 blended = mix(nightColor.rgb, dayColor.rgb, dayFactor);
            
            float sunsetFactor = smoothstep(-0.15, 0.05, sunDot) * smoothstep(0.25, 0.05, sunDot);
            vec3 sunsetColor = vec3(1.0, 0.55, 0.15) * sunsetFactor * 0.5;
            
            vec3 viewDir = normalize(-vWorldPosition);
            float viewDot = 1.0 - max(0.0, dot(viewDir, worldNorm));
            vec3 atmosphereColor = vec3(0.35, 0.65, 1.0) * pow(viewDot, 3.2) * max(0.2, dayFactor);

            gl_FragColor = vec4(blended + sunsetColor + atmosphereColor, 1.0);
        }
    `,
};

/* ─── Real-Time Sunlit Earth Sphere ───────────────────────── */

const RealTimeEarthSphere = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    const [dayTexture, nightTexture, bumpTexture] = useTexture([
        '/textures/earth_day.jpg',
        '/textures/earth_night.jpg',
        '/textures/earth_bump.png',
    ]);

    const sunPosition = useMemo(() => calculateSunPosition(new Date()), []);

    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                dayTexture: { value: dayTexture },
                nightTexture: { value: nightTexture },
                bumpTexture: { value: bumpTexture },
                sunDirection: { value: sunPosition.clone().normalize() },
            },
            vertexShader: EarthDayNightShader.vertexShader,
            fragmentShader: EarthDayNightShader.fragmentShader,
        });
    }, [dayTexture, nightTexture, bumpTexture, sunPosition]);

    useFrame(() => {
        const currentSunPos = calculateSunPosition(new Date());
        if (shaderMaterial) {
            shaderMaterial.uniforms.sunDirection.value.copy(currentSunPos.clone().normalize());
        }
    });

    return (
        <group>
            {/* Photorealistic Day/Night Earth Sphere */}
            <mesh ref={meshRef} material={shaderMaterial}>
                <sphereGeometry args={[100, 64, 64]} />
            </mesh>

            {/* Country Borders Line Overlay */}
            <WorldCountryBorders />

            {/* Atmosphere Halo */}
            <mesh scale={[1.025, 1.025, 1.025]}>
                <sphereGeometry args={[100, 48, 48]} />
                <meshBasicMaterial
                    color="#60a5fa"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
};

/* ─── Individual Office Location Pin (1/4 Scale) ─────────── */

interface OfficePinProps {
    office: {
        id: string;
        name: string;
        slug: string;
        countrySlug: string;
        latitude: number;
        longitude: number;
        availableDesks?: number;
        totalDesks?: number;
    };
    onSelectOffice: (countrySlug: string, officeSlug: string) => void;
}

const OfficePin = ({ office, onSelectOffice }: OfficePinProps) => {
    const position = useMemo(
        () => latLngToVector3(office.latitude, office.longitude, 100.2),
        [office.latitude, office.longitude]
    );

    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
            meshRef.current.scale.setScalar(hovered ? 1.4 : scale * 0.9);
        }
    });

    const isLondon = office.slug.includes('london');
    const badgeLabel = isLondon ? '🇬🇧 London HQ' : '🇬🇧 Leicester Hub';

    return (
        <group position={position}>
            {/* Compact Pin Sphere */}
            <mesh
                ref={meshRef}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                onClick={() => onSelectOffice(office.countrySlug, office.slug)}
            >
                <sphereGeometry args={[0.8, 20, 20]} />
                <meshStandardMaterial
                    color={hovered ? '#fbbf24' : isLondon ? '#3b82f6' : '#ef4444'}
                    emissive={hovered ? '#f59e0b' : isLondon ? '#2563eb' : '#dc2626'}
                    emissiveIntensity={3}
                    roughness={0.1}
                />
            </mesh>

            {/* Radar Pulsing Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.0, 1.8, 24]} />
                <meshBasicMaterial
                    color={isLondon ? '#3b82f6' : '#ef4444'}
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Vertical Anchor Stem Line */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[new Float32Array([0, 0, 0, 0, isLondon ? 3.0 : 4.5, 0]), 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial color={isLondon ? '#60a5fa' : '#38bdf8'} linewidth={1.5} transparent opacity={0.75} />
            </line>

            {/* 1/4 Scale Compact Micro-Pill Tag */}
            <Html
                position={[0, isLondon ? 3.6 : 5.1, 0]}
                distanceFactor={45}
                center
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
                <button
                    onClick={() => onSelectOffice(office.countrySlug, office.slug)}
                    className="group flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md text-white border border-amber-400/70 shadow-md shadow-amber-500/20 hover:scale-110 hover:border-amber-300 transition-transform whitespace-nowrap"
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${isLondon ? 'bg-cyan-400' : 'bg-emerald-400'} animate-ping flex-shrink-0`} />
                    <span className="text-[10px] font-bold text-white tracking-tight">
                        {badgeLabel}
                    </span>
                    <span className="text-[9px] text-amber-300 font-semibold px-1 rounded bg-white/10">
                        {office.availableDesks ?? 8}
                    </span>
                </button>
            </Html>
        </group>
    );
};

/* ─── Focused Camera Rig ──────────────────────────────────── */

const FocusedCameraRig = ({ countries }: { countries: Country[] }) => {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);

    useEffect(() => {
        if (countries.length === 1) {
            const targetCountry = countries[0];
            const targetVec = latLngToVector3(targetCountry.latitude, targetCountry.longitude, 100);
            
            const camDistance = 165;
            const camPos = targetVec.clone().normalize().multiplyScalar(camDistance);
            
            camera.position.set(camPos.x, camPos.y, camPos.z);
            camera.lookAt(0, 0, 0);
            if (controlsRef.current) {
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
            }
        }
    }, [countries, camera]);

    return (
        <OrbitControls
            ref={controlsRef}
            enableZoom
            enablePan={false}
            minDistance={125}
            maxDistance={380}
            autoRotate={false}
            dampingFactor={0.06}
        />
    );
};

/* ─── Main Globe Scene Canvas ────────────────────────────── */

interface GlobeSceneProps {
    countries: any[];
    onCountrySelect: (country: Country) => void;
}

const GlobeContent = ({ countries, onCountrySelect }: GlobeSceneProps) => {
    const router = useRouter();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const sunPos = useMemo(() => calculateSunPosition(new Date()), []);

    // Extract all offices across all countries
    const allOffices = useMemo(() => {
        const list: any[] = [];
        countries.forEach((c) => {
            if (Array.isArray(c.offices) && c.offices.length > 0) {
                list.push(...c.offices);
            } else {
                // Fallback default offices if offices array isn't populated
                list.push(
                    {
                        id: '55555555-5555-5555-5555-555555555555',
                        name: 'Leicester Hub',
                        slug: 'leicester-hub',
                        countrySlug: c.slug || 'united-kingdom',
                        latitude: 52.6339,
                        longitude: -1.1360,
                        availableDesks: 8,
                    },
                    {
                        id: '66666666-6666-6666-6666-666666666666',
                        name: 'London Office (Brandwidth HQ)',
                        slug: 'london-hq',
                        countrySlug: c.slug || 'united-kingdom',
                        latitude: 51.5235,
                        longitude: -0.1054,
                        availableDesks: 28,
                    }
                );
            }
        });
        return list;
    }, [countries]);

    const handleSelectOffice = (countrySlug: string, officeSlug: string) => {
        router.push(`/explore/${countrySlug}/${officeSlug}`);
    };

    return (
        <>
            {/* Astronomical Directional Sunlight */}
            <directionalLight
                position={[sunPos.x, sunPos.y, sunPos.z]}
                intensity={3.2}
                color="#fffcf2"
            />
            <ambientLight intensity={0.55} />
            <directionalLight position={[-sunPos.x, -sunPos.y, -sunPos.z]} intensity={0.35} color="#60a5fa" />

            {isDark && <Stars radius={350} depth={80} count={4000} factor={5} fade speed={0.4} />}

            <Suspense fallback={null}>
                <RealTimeEarthSphere />
            </Suspense>

            {/* Individual Office Pins on Globe */}
            {allOffices.map((office) => (
                <OfficePin
                    key={office.id}
                    office={office}
                    onSelectOffice={handleSelectOffice}
                />
            ))}

            <FocusedCameraRig countries={countries} />
        </>
    );
};

export const GlobeScene = ({ countries, onCountrySelect }: GlobeSceneProps) => {
    return (
        <div className="w-full h-full min-h-[650px] relative">
            <Canvas
                camera={{ position: [0, 100, 165], fov: 45 }}
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
                style={{ background: 'transparent' }}
            >
                <GlobeContent countries={countries} onCountrySelect={onCountrySelect} />
            </Canvas>
        </div>
    );
};

export default GlobeScene;