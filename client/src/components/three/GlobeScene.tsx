'use client';

import { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import type { Country } from '@/types/spatial';

/* ─── Helpers ────────────────────────────────────────────── */

const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
};

/* ─── Realistic NASA Blue Marble Earth Sphere ────────────── */

const EarthSphere = ({ isDark }: { isDark: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);

    const [dayTexture, nightTexture, bumpTexture] = useTexture([
        '/textures/earth_day.jpg',
        '/textures/earth_night.jpg',
        '/textures/earth_bump.png',
    ]);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.04;
        }
        if (atmosphereRef.current) {
            atmosphereRef.current.rotation.y += delta * 0.04;
        }
    });

    return (
        <group>
            {/* Core Photorealistic Earth */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[100, 64, 64]} />
                <meshStandardMaterial
                    map={isDark ? nightTexture : dayTexture}
                    bumpMap={bumpTexture}
                    bumpScale={2.5}
                    roughness={0.65}
                    metalness={0.1}
                    emissive={isDark ? '#38bdf8' : '#000000'}
                    emissiveMap={isDark ? nightTexture : undefined}
                    emissiveIntensity={isDark ? 0.8 : 0}
                />
            </mesh>

            {/* Atmosphere Glow Shell */}
            <mesh ref={atmosphereRef} scale={[1.025, 1.025, 1.025]}>
                <sphereGeometry args={[100, 48, 48]} />
                <meshBasicMaterial
                    color="#60a5fa"
                    transparent
                    opacity={isDark ? 0.18 : 0.12}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Outer Rim Light */}
            <mesh scale={[1.06, 1.06, 1.06]}>
                <sphereGeometry args={[100, 32, 32]} />
                <meshBasicMaterial
                    color="#38bdf8"
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
};

/* ─── Sci-Fi Beacon Location Pin ─────────────────────────── */

interface GlobePinProps {
    country: Country;
    onSelect: (country: Country) => void;
}

const GlobePin = ({ country, onSelect }: GlobePinProps) => {
    const position = useMemo(
        () => latLngToVector3(country.latitude, country.longitude, 100.5),
        [country.latitude, country.longitude]
    );

    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.2;
            meshRef.current.scale.setScalar(hovered ? 2.5 : scale * 1.5);
        }
    });

    return (
        <group position={position}>
            {/* Pulsing Core Beacon */}
            <mesh
                ref={meshRef}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                onClick={() => onSelect(country)}
            >
                <sphereGeometry args={[2.5, 32, 32]} />
                <meshStandardMaterial
                    color={hovered ? '#fbbf24' : '#ef4444'}
                    emissive={hovered ? '#f59e0b' : '#dc2626'}
                    emissiveIntensity={3}
                    roughness={0.1}
                />
            </mesh>

            {/* Radar Wave Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[3, 6, 32]} />
                <meshBasicMaterial
                    color="#ef4444"
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Floating Location Pill Tag */}
            <Html
                position={[0, 9, 0]}
                distanceFactor={160}
                center
                style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
            >
                <button
                    onClick={() => onSelect(country)}
                    className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border-2 border-amber-400 shadow-2xl shadow-amber-500/30 hover:scale-110 hover:border-amber-300 transition-all whitespace-nowrap"
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <div className="text-left">
                        <p className="font-black text-xs tracking-wide text-white">
                            🇬🇧 {country.name}
                        </p>
                        <p className="text-[10px] text-amber-300 font-semibold">
                            {country.officeCount} Office • {country.availableDesks} Desks Available
                        </p>
                    </div>
                </button>
            </Html>
        </group>
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

    return (
        <>
            <ambientLight intensity={isDark ? 0.8 : 1.6} />
            <directionalLight position={[150, 80, 120]} intensity={2.5} color="#ffffff" />
            <directionalLight position={[-150, -50, -100]} intensity={0.8} color="#93c5fd" />
            <pointLight position={[0, 100, 100]} intensity={1.2} color="#ffffff" />

            {isDark && <Stars radius={350} depth={80} count={4000} factor={5} fade speed={0.4} />}

            <Suspense fallback={null}>
                <EarthSphere isDark={isDark} />
            </Suspense>

            {countries.map((country) => (
                <GlobePin
                    key={country.id}
                    country={country}
                    onSelect={onCountrySelect}
                />
            ))}

            <OrbitControls
                enableZoom
                enablePan={false}
                minDistance={140}
                maxDistance={380}
                autoRotate
                autoRotateSpeed={0.3}
                dampingFactor={0.06}
            />
        </>
    );
};

export const GlobeScene = ({ countries, onCountrySelect }: GlobeSceneProps) => {
    return (
        <div className="w-full h-full min-h-[650px] relative">
            <Canvas
                camera={{ position: [0, 30, 250], fov: 45 }}
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
                style={{ background: 'transparent' }}
            >
                <GlobeContent countries={countries} onCountrySelect={onCountrySelect} />
            </Canvas>
        </div>
    );
};

export default GlobeScene;