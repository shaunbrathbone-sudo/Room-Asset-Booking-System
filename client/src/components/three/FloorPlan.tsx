'use client';

import { useMemo, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, useTexture, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import { STATUS_COLOURS } from '@/lib/constants';
import type { Floor, Zone, Desk, MeetingRoom, Amenity } from '@/types/spatial';

/* ─── Architectural Textured Ground Slab ─────────────────── */

interface FloorPlanTexturePlaneProps {
    imageUrl: string;
    isDark: boolean;
}

const FloorPlanTexturePlane = ({ imageUrl, isDark }: FloorPlanTexturePlaneProps) => {
    const texture = useTexture(imageUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
            <planeGeometry args={[68, 82]} />
            <meshStandardMaterial
                map={texture}
                transparent
                opacity={isDark ? 0.7 : 0.9}
                roughness={0.4}
                metalness={0.1}
            />
        </mesh>
    );
};

/* ─── Desk Node ──────────────────────────────────────────── */

interface DeskNodeProps {
    desk: Desk;
    isDark: boolean;
    onSelect: (desk: Desk) => void;
}

const DeskNode = ({ desk, isDark, onSelect }: DeskNodeProps) => {
    const [hovered, setHovered] = useState(false);
    const isPermanent = desk.status === 'permanent' || (desk as any).desk_type === 'permanent';
    const color = isPermanent 
        ? (isDark ? '#6366f1' : '#4f46e5') 
        : (STATUS_COLOURS[desk.status] || STATUS_COLOURS.available);
    
    const assignedName = (desk as any).assigned_user_name || (desk as any).label || desk.code.split('-').pop();

    return (
        <group position={[desk.x, 0.6, desk.y]}>
            {/* Workstation Desk Surface */}
            <mesh
                onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerLeave={() => setHovered(false)}
                onClick={(e) => { e.stopPropagation(); onSelect(desk); }}
            >
                <boxGeometry args={[2.4, 0.6, 1.6]} />
                <meshStandardMaterial
                    color={hovered ? '#38bdf8' : color}
                    emissive={hovered ? '#0284c7' : color}
                    emissiveIntensity={hovered ? 0.6 : (isDark ? 0.25 : 0.1)}
                    roughness={0.3}
                    metalness={0.2}
                />
            </mesh>

            {/* Dual Monitor on Stand */}
            <mesh position={[0, 0.7, -0.4]}>
                <boxGeometry args={[1.6, 0.6, 0.1]} />
                <meshStandardMaterial color={isDark ? '#0f172a' : '#334155'} roughness={0.5} />
            </mesh>

            {/* Ergonomic Office Chair */}
            <mesh position={[0, -0.1, 1.1]}>
                <cylinderGeometry args={[0.45, 0.45, 0.5, 12]} />
                <meshStandardMaterial color={isDark ? '#1e293b' : '#64748b'} roughness={0.6} />
            </mesh>

            {/* Desk Name / Allocated Person Label */}
            <Text
                position={[0, 1.25, 0]}
                fontSize={0.45}
                color={isDark ? '#ffffff' : '#0f172a'}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {assignedName}
            </Text>

            {/* Hover Tooltip Card */}
            {hovered && (
                <Html position={[0, 2.6, 0]} center style={{ pointerEvents: 'none' }}>
                    <div className="bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-cyan-400/50 whitespace-nowrap text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            <span>{assignedName}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] font-mono">{desk.code}</p>
                        <p className="text-[10px] text-slate-400 capitalize">
                            {isPermanent ? `Permanently Assigned (${assignedName})` : desk.status.replace('_', ' ')}
                        </p>
                        {desk.isBookable && desk.status === 'available' && (
                            <p className="text-emerald-400 text-[10px] font-bold mt-1">✨ Click to Reserve Desk</p>
                        )}
                    </div>
                </Html>
            )}
        </group>
    );
};

/* ─── Room Node ──────────────────────────────────────────── */

interface RoomNodeProps {
    room: MeetingRoom;
    zone: Zone;
    isDark: boolean;
    onSelect: (room: MeetingRoom) => void;
}

const RoomNode = ({ room, zone, isDark, onSelect }: RoomNodeProps) => {
    const [hovered, setHovered] = useState(false);
    const color = STATUS_COLOURS[room.status] || STATUS_COLOURS.available;

    return (
        <group position={[zone.x, 0.2, zone.y]}>
            {/* Glass Room Volume */}
            <mesh
                onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerLeave={() => setHovered(false)}
                onClick={(e) => { e.stopPropagation(); onSelect(room); }}
            >
                <boxGeometry args={[zone.width / 10, 0.4, zone.height / 10]} />
                <meshStandardMaterial
                    color={hovered ? '#38bdf8' : color}
                    transparent
                    opacity={isDark ? 0.35 : 0.25}
                    roughness={0.1}
                    metalness={0.2}
                />
            </mesh>

            {/* Illuminated Boundary Edges */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(zone.width / 10, 2.5, zone.height / 10)]} />
                <lineBasicMaterial color={hovered ? '#38bdf8' : (isDark ? '#0284c7' : '#2563eb')} linewidth={2} />
            </lineSegments>

            {/* Room Title */}
            <Text
                position={[0, 2.8, 0]}
                fontSize={0.65}
                color={isDark ? '#38bdf8' : '#1e40af'}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {room.name}
            </Text>

            {/* Tooltip */}
            {hovered && (
                <Html position={[0, 4.2, 0]} center style={{ pointerEvents: 'none' }}>
                    <div className="bg-slate-950/95 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-2xl border border-blue-500/50 whitespace-nowrap text-xs">
                        <p className="font-bold text-cyan-300">{room.name}</p>
                        <p className="text-slate-300 text-[11px]">Capacity: {room.capacity} Persons</p>
                        <p className="capitalize text-emerald-400 text-[10px] font-semibold mt-0.5">
                            Status: {room.status.replace('_', ' ')}
                        </p>
                    </div>
                </Html>
            )}
        </group>
    );
};

/* ─── Amenity Node ───────────────────────────────────────── */

interface AmenityNodeProps {
    amenity: Amenity;
    isDark: boolean;
}

const AmenityNode = ({ amenity, isDark }: AmenityNodeProps) => {
    return (
        <group position={[amenity.x, 0.4, amenity.y]}>
            <mesh>
                <cylinderGeometry args={[0.7, 0.7, 0.4, 16]} />
                <meshStandardMaterial 
                    color={isDark ? '#f59e0b' : '#d97706'} 
                    roughness={0.4} 
                    emissive="#d97706"
                    emissiveIntensity={0.2}
                />
            </mesh>
            <Text
                position={[0, 1.2, 0]}
                fontSize={0.4}
                color={isDark ? '#fbbf24' : '#92400e'}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {amenity.name}
            </Text>
        </group>
    );
};

/* ─── Zone Boundary ──────────────────────────────────────── */

interface ZoneBoundaryProps {
    zone: Zone;
    isDark: boolean;
}

const ZoneBoundary = ({ zone, isDark }: ZoneBoundaryProps) => {
    return (
        <group position={[zone.x, 0.05, zone.y]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[zone.width / 10, zone.height / 10]} />
                <meshStandardMaterial
                    color={isDark ? '#1e293b' : '#f1f5f9'}
                    transparent
                    opacity={isDark ? 0.3 : 0.6}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <Text
                position={[0, 0.1, -(zone.height / 20 + 0.6)]}
                fontSize={0.5}
                color={isDark ? '#94a3b8' : '#475569'}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {zone.name}
            </Text>
        </group>
    );
};

/* ─── Floor Plan Scene ───────────────────────────────────── */

interface FloorPlanProps {
    floor: Floor;
    onDeskSelect: (desk: Desk) => void;
    onRoomSelect: (room: MeetingRoom) => void;
}

const FloorPlanContent = ({ floor, onDeskSelect, onRoomSelect }: FloorPlanProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const zones = floor.zones ?? [];

    const planImageUrl = (floor as any).planImageUrl || (floor as any).plan_image_url;

    return (
        <>
            {/* Studio Lighting Setup */}
            <ambientLight intensity={isDark ? 0.85 : 1.2} />
            <directionalLight 
                position={[25, 45, 20]} 
                intensity={isDark ? 2.0 : 2.5} 
                color={isDark ? '#ffffff' : '#fffdf5'} 
                castShadow 
            />
            <directionalLight position={[-25, 30, -20]} intensity={isDark ? 0.9 : 1.1} color="#60a5fa" />
            <pointLight position={[0, 20, 0]} intensity={isDark ? 1.0 : 0.8} color="#38bdf8" />

            {/* Base Architectural Floor Bevel Slab */}
            <mesh position={[0, -0.5, 0]} receiveShadow>
                <boxGeometry args={[72, 1.0, 86]} />
                <meshStandardMaterial
                    color={isDark ? '#090d16' : '#ffffff'}
                    roughness={0.3}
                    metalness={0.1}
                />
            </mesh>

            {/* Subtle Grid Pattern */}
            <Grid
                position={[0, 0.01, 0]}
                args={[72, 86]}
                cellSize={2}
                cellThickness={0.8}
                cellColor={isDark ? '#1e293b' : '#e2e8f0'}
                sectionSize={10}
                sectionThickness={1.2}
                sectionColor={isDark ? '#334155' : '#cbd5e1'}
                fadeDistance={80}
            />

            {/* Architectural Blueprint Drawing Projection */}
            {planImageUrl && (
                <Suspense fallback={null}>
                    <FloorPlanTexturePlane imageUrl={planImageUrl} isDark={isDark} />
                </Suspense>
            )}

            {/* Zones, Rooms, Desks and Amenities */}
            {zones.map((zone) => (
                <group key={zone.id}>
                    <ZoneBoundary zone={zone} isDark={isDark} />

                    {/* Workstations / Desks */}
                    {zone.desks?.map((desk) => (
                        <DeskNode 
                            key={desk.id} 
                            desk={desk} 
                            isDark={isDark}
                            onSelect={onDeskSelect} 
                        />
                    ))}

                    {/* Meeting Rooms */}
                    {zone.meetingRooms?.map((room) => (
                        <RoomNode 
                            key={room.id} 
                            room={room} 
                            zone={zone} 
                            isDark={isDark}
                            onSelect={onRoomSelect} 
                        />
                    ))}

                    {/* Amenities */}
                    {zone.amenities?.map((amenity) => (
                        <AmenityNode 
                            key={amenity.id} 
                            amenity={amenity} 
                            isDark={isDark}
                        />
                    ))}
                </group>
            ))}

            <OrbitControls
                enableZoom
                enablePan
                minDistance={10}
                maxDistance={85}
                maxPolarAngle={Math.PI / 2.1}
                target={[0, 0, 0]}
                dampingFactor={0.05}
            />
        </>
    );
};

export const FloorPlan = ({ floor, onDeskSelect, onRoomSelect }: FloorPlanProps) => {
    return (
        <div className="w-full h-full min-h-[550px] relative">
            <Canvas
                camera={{ position: [0, 42, 32], fov: 48 }}
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
                shadows
                style={{ background: 'transparent' }}
            >
                <FloorPlanContent
                    floor={floor}
                    onDeskSelect={onDeskSelect}
                    onRoomSelect={onRoomSelect}
                />
            </Canvas>
        </div>
    );
};