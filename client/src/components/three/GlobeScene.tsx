'use client';

import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Country } from '@/types/spatial';

/* ─── Helpers ────────────────────────────────────────────── */

/** Convert lat/lng to 3D sphere position */
const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
};

/* ─── Globe Sphere ───────────────────────────────────────── */

const EarthSphere = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.03;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[100, 64, 64]} />
            <meshStandardMaterial
                color="#1a365d"
                roughness={0.8}
                metalness={0.2}
                wireframe={false}
            />
            {/* Atmosphere glow */}
            <mesh scale={[1.02, 1.02, 1.02]}>
                <sphereGeometry args={[100, 32, 32]} />
                <meshBasicMaterial
                    color="#3b82f6"
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                />
            </mesh>
        </mesh>
    );
};

/* ─── Location Pin ───────────────────────────────────────── */

interface GlobePinProps {
    country: Country;
    onSelect: (country: Country) => void;
}

const GlobePin = ({ country, onSelect }: GlobePinProps) => {
    const position = useMemo(
        () => latLngToVector3(country.latitude, country.longitude, 101),
        [country.latitude, country.longitude]
    );

    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
            meshRef.current.scale.setScalar(hovered ? 2.5 : scale * 1.5);
        }
    });

    return (
        <group position={position}>
            {/* Glowing pin */}
            <mesh
                ref={meshRef}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                onClick={() => onSelect(country)}
            >
                <sphereGeometry args={[1.2, 16, 16]} />
                <meshStandardMaterial
                    color={hovered ? '#60a5fa' : '#3b82f6'}
                    emissive={hovered ? '#2563eb' : '#1d4ed8'}
                    emissiveIntensity={hovered ? 2 : 0.8}
                />
            </mesh>

            {/* Pulse ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2, 3, 32]} />
                <meshBasicMaterial
                    color="#3b82f6"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Hover tooltip */}
            {hovered && (
                <Html distanceFactor={150} center style={{ pointerEvents: 'none' }}>
                    <div className="bg-slate-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl border border-blue-500/30 whitespace-nowrap">
                        <p className="font-bold text-lg">{country.name}</p>
                        <p className="text-blue-300 text-sm">
                            {country.officeCount} Office{(country.officeCount ?? 0) !== 1 ? 's' : ''} —{' '}
                            {country.availableDesks}/{country.totalDesks} Desks Available
                        </p>
                    </div>
                </Html>
            )}
        </group>
    );
};

/* ─── Main Globe Scene ───────────────────────────────────── */

interface GlobeSceneProps {
    countries: Country[];
    onCountrySelect: (country: Country) => void;
}

const GlobeContent = ({ countries, onCountrySelect }: GlobeSceneProps) => {
    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[100, 100, 50]} intensity={1.2} />
            <pointLight position={[-100, -100, -50]} intensity={0.3} color="#3b82f6" />

            <Stars radius={300} depth={100} count={3000} factor={4} fade speed={0.5} />
            <EarthSphere />

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
                minDistance={130}
                maxDistance={400}
                autoRotate
                autoRotateSpeed={0.3}
                dampingFactor={0.05}
            />
        </>
    );
};

export const GlobeScene = ({ countries, onCountrySelect }: GlobeSceneProps) => {
    return (
        <div className="w-full h-full min-h-[600px]">
            <Canvas
                camera={{ position: [0, 50, 250], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <GlobeContent countries={countries} onCountrySelect={onCountrySelect} />
            </Canvas>
        </div>
    );
};

/* ─── Missing import ─────────────────────────────────────── */
import { useState } from 'react';