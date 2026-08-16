'use client';

import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import type { Country } from '@/types/spatial';

/* ─── Helpers & Real-Time Solar Calculations ─────────────── */

const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
};

/** Calculate Sun position vector from current UTC time */
const calculateSunPosition = (date: Date = new Date(), radius: number = 300): THREE.Vector3 => {
    const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const sunLng = -((utcHours - 12) * 15);
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const sunLat = 23.44 * Math.sin(((dayOfYear - 80) / 365) * 2 * Math.PI);

    return latLngToVector3(sunLat, sunLng, radius);
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
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
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
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
            vec3 norm = normalize(vNormal);
            vec3 sunNorm = normalize(sunDirection);
            
            float sunDot = dot(norm, sunNorm);
            float dayFactor = smoothstep(-0.15, 0.25, sunDot);
            
            vec4 dayColor = texture2D(dayTexture, vUv);
            vec4 nightColor = texture2D(nightTexture, vUv);
            
            dayColor.rgb *= 1.4;
            nightColor.rgb *= vec3(1.4, 1.2, 0.9) * 2.0;
            
            vec3 blended = mix(nightColor.rgb, dayColor.rgb, dayFactor);
            
            float sunsetFactor = smoothstep(-0.1, 0.05, sunDot) * smoothstep(0.2, 0.05, sunDot);
            vec3 sunsetColor = vec3(1.0, 0.5, 0.1) * sunsetFactor * 0.45;
            
            float viewDot = 1.0 - max(0.0, dot(normalize(-vWorldPosition), norm));
            vec3 atmosphereColor = vec3(0.3, 0.6, 1.0) * pow(viewDot, 3.0) * max(0.25, dayFactor);

            gl_FragColor = vec4(blended + sunsetColor + atmosphereColor, 1.0);
        }
    `,
};

/* ─── Real-Time Sunlit Earth Sphere ───────────────────────── */

const RealTimeEarthSphere = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);

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
            {/* Photorealistic Day/Night Earth */}
            <mesh ref={meshRef} material={shaderMaterial}>
                <sphereGeometry args={[100, 64, 64]} />
            </mesh>

            {/* Atmosphere Glow */}
            <mesh ref={atmosphereRef} scale={[1.025, 1.025, 1.025]}>
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

/* ─── Compact Sci-Fi Beacon Location Pin (1/4 Scale) ──────── */

interface GlobePinProps {
    country: Country;
    onSelect: (country: Country) => void;
}

const GlobePin = ({ country, onSelect }: GlobePinProps) => {
    const position = useMemo(
        () => latLngToVector3(country.latitude, country.longitude, 100.2),
        [country.latitude, country.longitude]
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
        <group position={position}>
            {/* Compact Pin Sphere (Tiny dot right over Leicester) */}
            <mesh
                ref={meshRef}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                onClick={() => onSelect(country)}
            >
                <sphereGeometry args={[0.9, 20, 20]} />
                <meshStandardMaterial
                    color={hovered ? '#fbbf24' : '#ef4444'}
                    emissive={hovered ? '#f59e0b' : '#dc2626'}
                    emissiveIntensity={3}
                    roughness={0.1}
                />
            </mesh>

            {/* Compact Subtle Radar Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.1, 2.0, 24]} />
                <meshBasicMaterial
                    color="#ef4444"
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Mini Vertical Beacon Stem Line */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[new Float32Array([0, 0, 0, 0, 3.5, 0]), 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#38bdf8" linewidth={1.5} transparent opacity={0.75} />
            </line>

            {/* 1/4 Scale Compact Micro-Pill Tag */}
            <Html
                position={[0, 4.2, 0]}
                distanceFactor={45}
                center
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
                <button
                    onClick={() => onSelect(country)}
                    className="group flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md text-white border border-amber-400/70 shadow-md shadow-amber-500/20 hover:scale-110 hover:border-amber-300 transition-transform whitespace-nowrap"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
                    <span className="text-[10px] font-bold text-white tracking-tight">
                        🇬🇧 Leicester Hub
                    </span>
                    <span className="text-[9px] text-amber-300 font-semibold px-1 rounded bg-white/10">
                        {country.availableDesks}
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
    countries: Country[];
    onCountrySelect: (country: Country) => void;
}

const GlobeContent = ({ countries, onCountrySelect }: GlobeSceneProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const sunPos = useMemo(() => calculateSunPosition(new Date()), []);

    return (
        <>
            {/* Real Sun Light */}
            <directionalLight
                position={[sunPos.x, sunPos.y, sunPos.z]}
                intensity={3.2}
                color="#fffcf2"
            />
            <ambientLight intensity={0.6} />
            <directionalLight position={[-sunPos.x, -sunPos.y, -sunPos.z]} intensity={0.4} color="#60a5fa" />

            {isDark && <Stars radius={350} depth={80} count={4000} factor={5} fade speed={0.4} />}

            <Suspense fallback={null}>
                <RealTimeEarthSphere />
            </Suspense>

            {countries.map((country) => (
                <GlobePin
                    key={country.id}
                    country={country}
                    onSelect={onCountrySelect}
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