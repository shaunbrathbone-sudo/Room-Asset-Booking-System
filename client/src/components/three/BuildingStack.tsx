'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Floor } from '@/types/spatial';

/* ─── Individual Floor Slab ──────────────────────────────── */

interface FloorSlabProps {
    floor: Floor;
    index: number;
    totalFloors: number;
    hoveredIndex: number | null;
    onHover: (index: number | null) => void;
    onSelect: (floor: Floor) => void;
}

const FloorSlab = ({ floor, index, hoveredIndex, onHover, onSelect }: FloorSlabProps) => {
    const isHovered = hoveredIndex === index;
    const isExploded = hoveredIndex !== null;

    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);

    const baseY = index * 4;
    const targetY = isExploded ? index * 8 + (isHovered ? 2 : 0) : baseY;
    const targetScale = isHovered ? 1.05 : 1;

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.position.y = THREE.MathUtils.damp(
                groupRef.current.position.y,
                targetY,
                10,
                delta
            );
            const currentScale = THREE.MathUtils.damp(
                groupRef.current.scale.x,
                targetScale,
                10,
                delta
            );
            groupRef.current.scale.set(currentScale, 1, currentScale);
        }
    });

    const occupancy = floor.occupancyPercent ?? 0;
    const occupancyColor = occupancy > 80 ? '#ef4444' : occupancy > 50 ? '#f59e0b' : '#22c55e';

    return (
        <group ref={groupRef} position={[0, baseY, 0]}>
            {/* Floor slab */}
            <mesh
                ref={meshRef}
                onPointerEnter={(e) => { e.stopPropagation(); onHover(index); }}
                onPointerLeave={() => onHover(null)}
                onClick={(e) => { e.stopPropagation(); onSelect(floor); }}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[20, 3, 14]} />
                <meshStandardMaterial
                    color={isHovered ? '#3b82f6' : '#1e293b'}
                    roughness={0.4}
                    metalness={0.6}
                    transparent
                    opacity={0.92}
                />
            </mesh>

            {/* Floor edge highlight */}
            <mesh position={[0, 0, 7.01]}>
                <planeGeometry args={[20, 3]} />
                <meshStandardMaterial
                    color={occupancyColor}
                    emissive={occupancyColor}
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Label */}
            {isHovered && (
                <Html position={[12, 0, 0]} center style={{ pointerEvents: 'none' }}>
                    <div className="bg-slate-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl border border-blue-500/30 whitespace-nowrap">
                        <p className="font-bold">{floor.name}</p>
                        <p className="text-sm text-slate-300">
                            {occupancy}% Occupied
                        </p>
                    </div>
                </Html>
            )}

            {/* Floor name on front face */}
            <Text
                position={[0, 0, 7.1]}
                fontSize={1.2}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {floor.name}
            </Text>
        </group>
    );
};

/* ─── Building Stack Scene ───────────────────────────────── */

interface BuildingStackProps {
    floors: Floor[];
    officeName: string;
    onFloorSelect: (floor: Floor) => void;
}

const BuildingContent = ({ floors, onFloorSelect }: BuildingStackProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[20, 40, 20]} intensity={1} castShadow />
            <pointLight position={[-20, -10, 10]} intensity={0.3} color="#3b82f6" />

            <group position={[0, -(floors.length * 2), 0]}>
                {floors.map((floor, i) => (
                    <FloorSlab
                        key={floor.id}
                        floor={floor}
                        index={i}
                        totalFloors={floors.length}
                        hoveredIndex={hoveredIndex}
                        onHover={setHoveredIndex}
                        onSelect={onFloorSelect}
                    />
                ))}
            </group>

            <OrbitControls
                enableZoom
                enablePan
                minDistance={20}
                maxDistance={80}
                target={[0, 0, 0]}
                dampingFactor={0.05}
            />
        </>
    );
};

export const BuildingStack = ({ floors, officeName, onFloorSelect }: BuildingStackProps) => {
    return (
        <div className="w-full h-full min-h-[500px]">
            <Canvas
                camera={{ position: [25, 15, 25], fov: 50 }}
                gl={{ antialias: true }}
                shadows
                style={{ background: 'transparent' }}
            >
                <BuildingContent
                    floors={floors}
                    officeName={officeName}
                    onFloorSelect={onFloorSelect}
                />
            </Canvas>
        </div>
    );
};