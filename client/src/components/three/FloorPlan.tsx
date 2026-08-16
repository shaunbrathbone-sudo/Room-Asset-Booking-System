'use client';

import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { STATUS_COLOURS } from '@/lib/constants';
import type { Floor, Zone, Desk, MeetingRoom, Amenity } from '@/types/spatial';

/* ─── Desk Node ──────────────────────────────────────────── */

interface DeskNodeProps {
    desk: Desk;
    onSelect: (desk: Desk) => void;
}

const DeskNode = ({ desk, onSelect }: DeskNodeProps) => {
    const [hovered, setHovered] = useState(false);
    const color = STATUS_COLOURS[desk.status] || STATUS_COLOURS.available;

    return (
        <group position={[desk.x, 0.5, desk.y]}>
            <mesh
                onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerLeave={() => setHovered(false)}
                onClick={(e) => { e.stopPropagation(); onSelect(desk); }}
            >
                <boxGeometry args={[2, 0.8, 1.5]} />
                <meshStandardMaterial
                    color={hovered ? '#60a5fa' : color}
                    emissive={hovered ? '#2563eb' : color}
                    emissiveIntensity={hovered ? 0.5 : 0.15}
                    roughness={0.5}
                    metalness={0.3}
                />
            </mesh>

            {/* Chair */}
            <mesh position={[0, 0, 1.2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.5, 8]} />
                <meshStandardMaterial color="#475569" roughness={0.7} />
            </mesh>

            {/* Desk label */}
            <Text
                position={[0, 1.2, 0]}
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {desk.code.split('-').pop()}
            </Text>

            {/* Hover tooltip */}
            {hovered && (
                <Html position={[0, 2.5, 0]} center style={{ pointerEvents: 'none' }}>
                    <div className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-xl border border-blue-500/30 whitespace-nowrap text-sm">
                        <p className="font-semibold">{desk.code}</p>
                        <p className="text-slate-300 capitalize">{desk.status.replace('_', ' ')}</p>
                        {desk.isBookable && desk.status === 'available' && (
                            <p className="text-green-400 text-xs mt-1">Click to book</p>
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
    onSelect: (room: MeetingRoom) => void;
}

const RoomNode = ({ room, zone, onSelect }: RoomNodeProps) => {
    const [hovered, setHovered] = useState(false);
    const color = STATUS_COLOURS[room.status] || STATUS_COLOURS.available;

    return (
        <group position={[zone.x, 0.2, zone.y]}>
            {/* Room outline */}
            <mesh
                onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerLeave={() => setHovered(false)}
                onClick={(e) => { e.stopPropagation(); onSelect(room); }}
            >
                <boxGeometry args={[zone.width / 10, 0.3, zone.height / 10]} />
                <meshStandardMaterial
                    color={hovered ? '#60a5fa' : color}
                    transparent
                    opacity={0.4}
                    roughness={0.2}
                    metalness={0.1}
                />
            </mesh>

            {/* Glass walls */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(zone.width / 10, 2, zone.height / 10)]} />
                <lineBasicMaterial color={hovered ? '#60a5fa' : '#94a3b8'} linewidth={1} />
            </lineSegments>

            {/* Room name */}
            <Text
                position={[0, 2.5, 0]}
                fontSize={0.7}
                color="#60a5fa"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {room.name}
            </Text>

            {/* Hover tooltip */}
            {hovered && (
                <Html position={[0, 4, 0]} center style={{ pointerEvents: 'none' }}>
                    <div className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-xl border border-blue-500/30 whitespace-nowrap text-sm">
                        <p className="font-semibold">{room.name}</p>
                        <p className="text-slate-300">Capacity: {room.capacity}</p>
                        <p className="capitalize text-slate-300">{room.status.replace('_', ' ')}</p>
                    </div>
                </Html>
            )}
        </group>
    );
};

/* ─── Amenity Node ───────────────────────────────────────── */

interface AmenityNodeProps {
    amenity: Amenity;
}

const AmenityNode = ({ amenity }: AmenityNodeProps) => {
    return (
        <group position={[amenity.x, 0.3, amenity.y]}>
            <mesh>
                <cylinderGeometry args={[0.6, 0.6, 0.4, 6]} />
                <meshStandardMaterial color="#6b7280" roughness={0.8} transparent opacity={0.6} />
            </mesh>
            <Text
                position={[0, 1.2, 0]}
                fontSize={0.4}
                color="#9ca3af"
                anchorX="center"
            >
                {amenity.name}
            </Text>
        </group>
    );
};

/* ─── Zone Boundary ──────────────────────────────────────── */

interface ZoneBoundaryProps {
    zone: Zone;
}

const ZoneBoundary = ({ zone }: ZoneBoundaryProps) => {
    return (
        <group position={[zone.x, 0.05, zone.y]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[zone.width / 10, zone.height / 10]} />
                <meshStandardMaterial
                    color="#1e293b"
                    transparent
                    opacity={0.15}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <Text
                position={[0, 0.1, -(zone.height / 20 + 0.5)]}
                fontSize={0.5}
                color="#64748b"
                anchorX="center"
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
    const zones = floor.zones ?? [];

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[30, 50, 20]} intensity={0.8} />
            <pointLight position={[-20, 30, -10]} intensity={0.3} color="#3b82f6" />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 80]} />
                <meshStandardMaterial color="#0f172a" roughness={1} />
            </mesh>

            {/* Zones and their contents */}
            {zones.map((zone) => (
                <group key={zone.id}>
                    <ZoneBoundary zone={zone} />

                    {/* Desks */}
                    {zone.desks?.map((desk) => (
                        <DeskNode key={desk.id} desk={desk} onSelect={onDeskSelect} />
                    ))}

                    {/* Meeting Rooms */}
                    {zone.meetingRooms?.map((room) => (
                        <RoomNode key={room.id} room={room} zone={zone} onSelect={onRoomSelect} />
                    ))}

                    {/* Amenities */}
                    {zone.amenities?.map((amenity) => (
                        <AmenityNode key={amenity.id} amenity={amenity} />
                    ))}
                </group>
            ))}

            <OrbitControls
                enableZoom
                enablePan
                minDistance={10}
                maxDistance={60}
                maxPolarAngle={Math.PI / 2.2}
                target={[0, 0, 0]}
                dampingFactor={0.05}
            />
        </>
    );
};

export const FloorPlan = ({ floor, onDeskSelect, onRoomSelect }: FloorPlanProps) => {
    return (
        <div className="w-full h-full min-h-[500px]">
            <Canvas
                camera={{ position: [0, 40, 30], fov: 50 }}
                gl={{ antialias: true }}
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