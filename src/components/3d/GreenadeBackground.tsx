import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

const GreenadeBackground: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Group>(null);

    // Subscribe to visual trigger
    const visualTrigger = useGameStore((state) => state.visualTrigger);
    const lastTriggerRef = useRef(0);
    const explosionProgress = useRef(0);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Check for new trigger
        if (visualTrigger > lastTriggerRef.current) {
            lastTriggerRef.current = visualTrigger;
            explosionProgress.current = 1.0; // Start explosion
        }

        // Decay explosion
        explosionProgress.current = THREE.MathUtils.lerp(explosionProgress.current, 0, 0.05);

        if (groupRef.current) {
            // Gentle floating + Explosion vibration
            const shake = explosionProgress.current * 0.5 * Math.sin(time * 50);
            groupRef.current.position.y = Math.sin(time * 0.5) * 0.2 + shake;

            // Mouse interaction
            const mouseX = state.mouse.x * 0.5;
            const mouseY = state.mouse.y * 0.5;

            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseY, 0.1);

            // Spin faster during explosion
            const spinSpeed = 0.2 + (explosionProgress.current * 5);
            groupRef.current.rotation.y += (mouseX * 0.01) + (state.clock.getDelta() * spinSpeed);
        }

        if (meshRef.current) {
            // Pulse effect + Explosion Expansion
            const baseScale = 1 + Math.sin(time * 2) * 0.02;
            const explosionScale = 1 + (explosionProgress.current * 0.5);
            meshRef.current.scale.set(baseScale * explosionScale, baseScale * explosionScale, baseScale * explosionScale);

            // Color flash
            if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
                const baseColor = new THREE.Color("#2E7D32");
                const flashColor = new THREE.Color("#4CAF50"); // Brighter green
                meshRef.current.material.color.lerpColors(baseColor, flashColor, explosionProgress.current);
                meshRef.current.material.emissiveIntensity = explosionProgress.current * 2;
            }
        }

        if (particlesRef.current) {
            // Expand particles during explosion
            const expansion = 1 + (explosionProgress.current * 3);
            particlesRef.current.scale.set(expansion, expansion, expansion);
            particlesRef.current.rotation.y -= explosionProgress.current * 0.1;
        }
    });

    return (
        <>
            <color attach="background" args={['#1B5E20']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#43A047" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#C8E6C9" />

            <group ref={groupRef}>
                {/* Main "Grenade" Shape - Icosahedron */}
                <mesh ref={meshRef}>
                    <icosahedronGeometry args={[2.5, 1]} />
                    <meshStandardMaterial
                        color="#2E7D32"
                        roughness={0.2}
                        metalness={0.8}
                        wireframe={false}
                        flatShading
                    />
                </mesh>

                {/* Wireframe Overlay */}
                <mesh scale={[2.55, 2.55, 2.55]}>
                    <icosahedronGeometry args={[2.5, 1]} />
                    <meshBasicMaterial
                        color="#43A047"
                        wireframe
                        transparent
                        opacity={0.3}
                    />
                </mesh>

                {/* Floating Particles */}
                <group ref={particlesRef}>
                    {Array.from({ length: 20 }).map((_, i) => (
                        <mesh
                            key={i}
                            position={[
                                (Math.random() - 0.5) * 10,
                                (Math.random() - 0.5) * 10,
                                (Math.random() - 0.5) * 10
                            ]}
                            scale={Math.random() * 0.2 + 0.1}
                        >
                            <octahedronGeometry />
                            <meshStandardMaterial color="#C8E6C9" emissive="#43A047" emissiveIntensity={0.5} />
                        </mesh>
                    ))}
                </group>
            </group>

            {/* Fog for depth */}
            <fog attach="fog" args={['#1B5E20', 5, 20]} />
        </>
    );
};

export default GreenadeBackground;
