'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
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

/** Create procedural Earth texture with grid lines and continent dot matrices */
const createProceduralEarthTexture = (isDark: boolean): THREE.Texture => {
    if (typeof window === 'undefined') {
        return new THREE.Texture();
    }

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Ocean gradient background
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (isDark) {
        oceanGrad.addColorStop(0, '#0a1526');
        oceanGrad.addColorStop(0.5, '#050c18');
        oceanGrad.addColorStop(1, '#0a1526');
    } else {
        oceanGrad.addColorStop(0, '#0f2744');
        oceanGrad.addColorStop(0.5, '#1e3a5f');
        oceanGrad.addColorStop(1, '#0f2744');
    }
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Latitude & Longitude graticule grid lines
    ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(96, 165, 250, 0.25)';
    ctx.lineWidth = 1.5;

    // Latitudes
    for (let lat = -80; lat <= 80; lat += 20) {
        const y = ((90 - lat) / 180) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Longitudes
    for (let lng = -180; lng <= 180; lng += 30) {
        const x = ((lng + 180) / 360) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Equator & Prime Meridian highlight
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Procedural glowing continent landmass shapes
    ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(147, 197, 253, 0.6)';

    const drawLandmass = (pts: [number, number][]) => {
        ctx.beginPath();
        pts.forEach(([lng, lat], idx) => {
            const x = ((lng + 180) / 360) * canvas.width;
            const y = ((90 - lat) / 180) * canvas.height;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
    };

    // Europe & UK
    drawLandmass([[-10, 36], [0, 42], [10, 44], [30, 42], [40, 55], [30, 70], [10, 65], [-5, 58], [-10, 50]]);
    drawLandmass([[-8, 50], [2, 51], [2, 59], [-5, 59], [-6, 54]]);
    drawLandmass([[-10, 51], [-6, 51], [-6, 55], [-10, 55]]);
    // North America
    drawLandmass([[-165, 65], [-135, 70], [-80, 75], [-60, 50], [-75, 25], [-100, 20], [-120, 35], [-130, 55]]);
    // South America
    drawLandmass([[-80, 10], [-50, -5], [-35, -10], [-55, -40], [-70, -55], [-75, -20]]);
    // Africa
    drawLandmass([[-15, 30], [30, 32], [50, 12], [40, -10], [30, -34], [15, -34], [10, 5], [-15, 15]]);
    // Asia
    drawLandmass([[40, 40], [60, 40], [80, 30], [100, 20], [120, 30], [140, 40], [150, 60], [130, 70], [70, 70], [50, 55]]);
    // Australia
    drawLandmass([[115, -20], [150, -15], [152, -35], [135, -38], [115, -32]]);

    // Add high-tech glowing dot matrix over land
    ctx.fillStyle = isDark ? '#60a5fa' : '#38bdf8';
    for (let x = 0; x < canvas.width; x += 16) {
        for (let y = 0; y < canvas.height; y += 16) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[3] > 80 && Math.random() > 0.4) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fillStyle = isDark ? 'rgba(147, 197, 253, 0.9)' : 'rgba(255, 255, 255, 0.95)';
                ctx.fill();
            }
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
};

/* ─── Globe Sphere with Atmosphere Glow ──────────────────── */

const EarthSphere = ({ isDark }: { isDark: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);

    const earthTexture = useMemo(() => createProceduralEarthTexture(isDark), [isDark]);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.05;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.07;
        }
    });

    return (
        <group>
            {/* Core Earth Sphere with Custom Map */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[100, 64, 64]} />
                <meshStandardMaterial
                    map={earthTexture}
                    roughness={0.5}
                    metalness={0.3}
                    emissive={isDark ? '#0c1a2e' : '#1e3a5f'}
                    emissiveIntensity={0.6}
                />
            </mesh>

            {/* Glowing Sci-Fi Wireframe Grid Shell */}
            <mesh scale={[1.008, 1.008, 1.008]}>
                <sphereGeometry args={[100, 36, 18]} />
                <meshBasicMaterial
                    color="#38bdf8"
                    wireframe
                    transparent
                    opacity={0.12}
                />
            </mesh>

            {/* Outer Atmosphere Glow Shell */}
            <mesh ref={cloudsRef} scale={[1.03, 1.03, 1.03]}>
                <sphereGeometry args={[100, 48, 48]} />
                <meshBasicMaterial
                    color="#60a5fa"
                    transparent
                    opacity={0.18}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Outer Rim Fresnel Ring */}
            <mesh scale={[1.08, 1.08, 1.08]}>
                <sphereGeometry args={[100, 32, 32]} />
                <meshBasicMaterial
                    color="#3b82f6"
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
            const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
            meshRef.current.scale.setScalar(hovered ? 2.8 : scale * 1.6);
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
                    color={hovered ? '#67e8f9' : '#00f0ff'}
                    emissive={hovered ? '#38bdf8' : '#0284c7'}
                    emissiveIntensity={3}
                    roughness={0.1}
                />
            </mesh>

            {/* Expanding Radar Wave Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[3, 6, 32]} />
                <meshBasicMaterial
                    color="#38bdf8"
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Floating Persistent Location Pill Tag */}
            <Html
                position={[0, 8, 0]}
                distanceFactor={160}
                center
                style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
            >
                <button
                    onClick={() => onSelect(country)}
                    className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md text-white border-2 border-cyan-400 shadow-2xl shadow-cyan-500/40 hover:scale-110 hover:border-cyan-300 transition-all whitespace-nowrap"
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <div className="text-left">
                        <p className="font-black text-xs tracking-wide text-white">
                            🇬🇧 {country.name}
                        </p>
                        <p className="text-[10px] text-cyan-300 font-semibold">
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
            <ambientLight intensity={isDark ? 0.9 : 1.4} />
            <directionalLight position={[150, 100, 100]} intensity={2.2} color="#ffffff" />
            <directionalLight position={[-150, -100, -100]} intensity={1.0} color="#38bdf8" />
            <pointLight position={[0, 150, 100]} intensity={1.8} color="#00f0ff" />

            {isDark && <Stars radius={350} depth={80} count={3500} factor={5} fade speed={0.4} />}

            <EarthSphere isDark={isDark} />

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
                autoRotateSpeed={0.4}
                dampingFactor={0.06}
            />
        </>
    );
};

export const GlobeScene = ({ countries, onCountrySelect }: GlobeSceneProps) => {
    return (
        <div className="w-full h-full min-h-[650px] relative">
            <Canvas
                camera={{ position: [0, 40, 260], fov: 45 }}
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
                style={{ background: 'transparent' }}
            >
                <GlobeContent countries={countries} onCountrySelect={onCountrySelect} />
            </Canvas>
        </div>
    );
};

export default GlobeScene;