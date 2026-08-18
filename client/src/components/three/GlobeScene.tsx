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

/* ─── Country Borders Line Layer ─────────────────────────── */

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

/* ─── Thick Illuminated 3D Leader Beam ─────────────────────── */

interface LeaderBeamProps {
    start: THREE.Vector3;
    end: THREE.Vector3;
    color: string;
}

const LeaderBeam = ({ start, end, color }: LeaderBeamProps) => {
    const { position, quaternion, length } = useMemo(() => {
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(end, start);
        const len = dir.length();

        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

        return { position: mid, quaternion: quat, length: len };
    }, [start, end]);

    return (
        <mesh position={position} quaternion={quaternion}>
            <cylinderGeometry args={[0.16, 0.16, length, 8]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2.5}
                roughness={0.2}
            />
        </mesh>
    );
};

/* ─── Geographic Side HUD Office Pin ──────────────────────── */

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
    const isLondon = office.slug.includes('london');
    const isIndia = office.slug.includes('india') || office.countrySlug === 'india';

    const badgeLabel = isIndia
        ? '🇮🇳 Noida Tech Hub'
        : isLondon
        ? '🇬🇧 London HQ'
        : '🇬🇧 Leicester Hub';

    const themeColor = isIndia ? '#f97316' : isLondon ? '#38bdf8' : '#f59e0b';

    // Dot is placed at exact geographic coordinates
    const dotPos = useMemo(
        () => latLngToVector3(office.latitude, office.longitude, 100.25),
        [office.latitude, office.longitude]
    );

    // Label is placed with comfortable rightward/eastward offset
    const labelLngOffset = isIndia ? 6.8 : isLondon ? 6.2 : 5.8;
    const labelLatOffset = isIndia ? 0.0 : isLondon ? -0.2 : 0.2;
    const labelPos = useMemo(
        () => latLngToVector3(office.latitude + labelLatOffset, office.longitude + labelLngOffset, 100.5),
        [office.latitude, office.longitude, labelLatOffset, labelLngOffset]
    );

    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
            meshRef.current.scale.setScalar(hovered ? 1.4 : scale * 0.9);
        }
    });

    return (
        <group>
            {/* Thicker 3D Illuminated Leader Beam */}
            <LeaderBeam start={dotPos} end={labelPos} color={themeColor} />

            {/* Pin Dot right over physical city location */}
            <group position={dotPos}>
                <mesh
                    ref={meshRef}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                    onClick={() => onSelectOffice(office.countrySlug, office.slug)}
                >
                    <sphereGeometry args={[0.9, 20, 20]} />
                    <meshStandardMaterial
                        color={hovered ? '#fbbf24' : themeColor}
                        emissive={hovered ? '#f59e0b' : themeColor}
                        emissiveIntensity={3}
                        roughness={0.1}
                    />
                </mesh>

                {/* Radar Pulsing Ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.0, 1.7, 24]} />
                    <meshBasicMaterial
                        color={themeColor}
                        transparent
                        opacity={0.4}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>

            {/* Side-Positioned Micro HUD Tag */}
            <group position={labelPos}>
                <Html
                    distanceFactor={45}
                    center
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                >
                    <button
                        onClick={() => onSelectOffice(office.countrySlug, office.slug)}
                        className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/95 backdrop-blur-md text-white border border-amber-400/80 shadow-xl shadow-amber-500/20 hover:scale-110 hover:border-amber-300 transition-transform whitespace-nowrap"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${isIndia ? 'bg-orange-400' : isLondon ? 'bg-cyan-400' : 'bg-emerald-400'} animate-ping flex-shrink-0`} />
                        <span className="text-[10px] font-bold text-white tracking-tight">
                            {badgeLabel}
                        </span>
                        <span className="text-[9px] text-amber-300 font-semibold px-1 rounded bg-white/15">
                            {office.availableDesks ?? 24}
                        </span>
                    </button>
                </Html>
            </group>
        </group>
    );
};

/* ─── Live User Location Pin ─────────────────────────────── */

interface UserLiveLocationPinProps {
    userLat: number;
    userLng: number;
}

const UserLiveLocationPin = ({ userLat, userLng }: UserLiveLocationPinProps) => {
    const dotPos = useMemo(() => latLngToVector3(userLat, userLng, 100.4), [userLat, userLng]);
    const labelPos = useMemo(() => {
        const p = dotPos.clone();
        p.x += 6.5;
        p.y += 5.5;
        return p;
    }, [dotPos]);

    const pulseRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (pulseRef.current) {
            const s = 1 + (state.clock.elapsedTime % 1.5) * 1.5;
            pulseRef.current.scale.set(s, s, s);
            const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = Math.max(0, 0.7 - (state.clock.elapsedTime % 1.5) * 0.45);
        }
    });

    return (
        <group>
            <LeaderBeam start={dotPos} end={labelPos} color="#38bdf8" />
            <group position={dotPos}>
                {/* Core Glowing Dot */}
                <mesh>
                    <sphereGeometry args={[1.2, 24, 24]} />
                    <meshStandardMaterial
                        color="#38bdf8"
                        emissive="#0284c7"
                        emissiveIntensity={3.5}
                        roughness={0.1}
                    />
                </mesh>

                {/* Radar Wave */}
                <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.2, 2.4, 32]} />
                    <meshBasicMaterial
                        color="#38bdf8"
                        transparent
                        opacity={0.7}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>

            {/* User HUD Tag */}
            <group position={labelPos}>
                <Html distanceFactor={45} center style={{ pointerEvents: 'none' }}>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/95 backdrop-blur-md text-cyan-300 border border-cyan-400 shadow-xl shadow-cyan-500/30 whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">
                            📍 You Are Here
                        </span>
                    </div>
                </Html>
            </group>
        </group>
    );
};

/* ─── Device GPS Geolocation Camera Rig ──────────────────── */

interface DeviceGeolocationCameraRigProps {
    countries: Country[];
    userLocation: { latitude: number; longitude: number } | null;
    onLocationFound: (loc: { latitude: number; longitude: number }) => void;
}

const DeviceGeolocationCameraRig = ({ countries, userLocation, onLocationFound }: DeviceGeolocationCameraRigProps) => {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);
    const targetCamPos = useRef<THREE.Vector3 | null>(null);

    useEffect(() => {
        const fallbackTarget = countries[0] || { latitude: 52.6339, longitude: -1.1360 };
        const camDistance = 165;

        const applyTarget = (lat: number, lng: number) => {
            const userVec = latLngToVector3(lat, lng, 100);
            targetCamPos.current = userVec.clone().normalize().multiplyScalar(camDistance);
        };

        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    onLocationFound({ latitude: lat, longitude: lng });
                    applyTarget(lat, lng);
                },
                (_error) => {
                    applyTarget(fallbackTarget.latitude, fallbackTarget.longitude);
                },
                { timeout: 6000, enableHighAccuracy: true }
            );

            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    onLocationFound({ latitude: lat, longitude: lng });
                },
                undefined,
                { enableHighAccuracy: true }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            applyTarget(fallbackTarget.latitude, fallbackTarget.longitude);
        }
    }, [countries]);

    useEffect(() => {
        if (userLocation) {
            const userVec = latLngToVector3(userLocation.latitude, userLocation.longitude, 100);
            targetCamPos.current = userVec.clone().normalize().multiplyScalar(165);
        }
    }, [userLocation]);

    useFrame(() => {
        if (targetCamPos.current) {
            camera.position.lerp(targetCamPos.current, 0.05);
            camera.lookAt(0, 0, 0);
            if (controlsRef.current) {
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
            }
            if (camera.position.distanceTo(targetCamPos.current) < 0.2) {
                targetCamPos.current = null;
            }
        }
    });

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
    userLocation?: { latitude: number; longitude: number } | null;
    onLocationFound?: (loc: { latitude: number; longitude: number }) => void;
}

const GlobeContent = ({ countries, onCountrySelect, userLocation, onLocationFound }: GlobeSceneProps) => {
    const router = useRouter();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const sunPos = useMemo(() => calculateSunPosition(new Date()), []);

    // Extract all offices across all countries
    const allOffices = useMemo(() => {
        const list: any[] = [];
        countries.forEach((c) => {
            if (Array.isArray(c.offices) && c.offices.length > 0) {
                c.offices.forEach((off: any) => {
                    list.push({
                        ...off,
                        countrySlug: off.countrySlug || c.slug,
                    });
                });
            }
        });

        // If list is empty, default to registered hubs
        if (list.length === 0) {
            list.push(
                {
                    id: '55555555-5555-5555-5555-555555555555',
                    name: 'Leicester Hub',
                    slug: 'leicester-hub',
                    countrySlug: 'united-kingdom',
                    latitude: 52.6339,
                    longitude: -1.1360,
                    availableDesks: 8,
                },
                {
                    id: '66666666-6666-6666-6666-666666666666',
                    name: 'London Office (Brandwidth HQ)',
                    slug: 'london-hq',
                    countrySlug: 'united-kingdom',
                    latitude: 51.5235,
                    longitude: -0.1054,
                    availableDesks: 28,
                },
                {
                    id: '88888888-8888-8888-8888-888888888888',
                    name: 'Cloudfy Ecommerce India Pvt Ltd',
                    slug: 'cloudfy-india-noida',
                    countrySlug: 'india',
                    latitude: 28.6280,
                    longitude: 77.3649,
                    availableDesks: 24,
                }
            );
        }
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

            {/* Individual Office Pins with Clean Gap Side Labels */}
            {allOffices.map((office) => (
                <OfficePin
                    key={office.id}
                    office={office}
                    onSelectOffice={handleSelectOffice}
                />
            ))}

            {/* Live Browser User Location Pin */}
            {userLocation && (
                <UserLiveLocationPin
                    userLat={userLocation.latitude}
                    userLng={userLocation.longitude}
                />
            )}

            <DeviceGeolocationCameraRig
                countries={countries}
                userLocation={userLocation || null}
                onLocationFound={onLocationFound || (() => {})}
            />
        </>
    );
};

export const GlobeScene = ({ countries, onCountrySelect, userLocation, onLocationFound }: GlobeSceneProps) => {
    return (
        <div className="w-full h-full min-h-[650px] relative">
            <Canvas
                camera={{ position: [0, 100, 165], fov: 45 }}
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
                style={{ background: 'transparent' }}
            >
                <GlobeContent
                    countries={countries}
                    onCountrySelect={onCountrySelect}
                    userLocation={userLocation}
                    onLocationFound={onLocationFound}
                />
            </Canvas>
        </div>
    );
};

export default GlobeScene;