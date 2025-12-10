import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

const StreakTower: React.FC = () => {
    const { streak } = useGameStore();
    const groupRef = useRef<THREE.Group>(null);

    // Calculate blocks based on streak
    // Cap visual blocks to avoid infinite height, maybe 30 days max visual distinctness
    // or group them: 1 block = 1 day.
    const blocks = useMemo(() => {
        const count = Math.max(1, streak); // Always show base
        return Array.from({ length: count }).map((_, i) => ({
            position: [7, i * 0.6 - 5, -5] as [number, number, number], // Start lower back
            scale: [1 - (i * 0.02), 0.5, 1 - (i * 0.02)] as [number, number, number], // Taper slightly
            rotation: i * 0.2 // Spiral effect
        }));
    }, [streak]);

    useFrame(() => {
        if (groupRef.current) {
            // Slow rotation for the whole tower
            groupRef.current.rotation.y += 0.005;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Base Platform */}
            <mesh position={[7, -5.5, -5]} receiveShadow>
                <cylinderGeometry args={[2, 2.5, 0.5, 32]} />
                <meshStandardMaterial color="#1B5E20" roughness={0.3} metalness={0.6} />
            </mesh>

            {blocks.map((props, i) => (
                <mesh key={i} position={props.position} scale={props.scale as [number, number, number]} rotation={[0, props.rotation, 0]} castShadow receiveShadow>
                    {/* Hexagonal Prisms for Tech feeling */}
                    <cylinderGeometry args={[1, 1, 0.5, 6]} />
                    <meshStandardMaterial
                        color={i === blocks.length - 1 && streak > 0 ? "#4CAF50" : "#2E7D32"} // Top block is brighter
                        emissive={i === blocks.length - 1 && streak > 0 ? "#4CAF50" : "#000000"}
                        emissiveIntensity={0.5}
                        roughness={0.2}
                        metalness={0.8}
                        transparent
                        opacity={0.9}
                    />
                    {/* Wireframe edge for style */}
                    <lineSegments>
                        <edgesGeometry args={[new THREE.CylinderGeometry(1, 1, 0.5, 6)]} />
                        <lineBasicMaterial color="#43A047" opacity={0.5} transparent />
                    </lineSegments>
                </mesh>
            ))}

            {/* Floating text/icon above tower if streak > 0 */}
            {streak > 0 && (
                <mesh position={[7, (blocks.length * 0.6) - 4, -5]}>
                    <sphereGeometry args={[0.2]} />
                    <meshBasicMaterial color="#FFD700" />
                    <pointLight distance={5} intensity={1} color="#FFD700" />
                </mesh>
            )}
        </group>
    );
};

export default StreakTower;
