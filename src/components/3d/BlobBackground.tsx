import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Blob = ({ position, color, scale, speed }: { position: [number, number, number], color: string, scale: number, speed: number }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const timeOffset = useMemo(() => Math.random() * 100, []);

    useFrame((state) => {
        if (mesh.current) {
            const time = state.clock.getElapsedTime();
            // Floating movement
            mesh.current.position.y = position[1] + Math.sin(time * speed + timeOffset) * 0.5;
            mesh.current.position.x = position[0] + Math.cos(time * speed * 0.5 + timeOffset) * 0.3;

            // Gentle rotation
            mesh.current.rotation.x = time * 0.1 + timeOffset;
            mesh.current.rotation.y = time * 0.15 + timeOffset;
        }
    });

    return (
        <mesh ref={mesh} position={position} scale={scale}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
                color={color}
                roughness={0.4}
                metalness={0.1}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
};

const BlobBackground: React.FC = () => {
    return (
        <>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF4757" />

            {/* Large background blobs */}
            <Blob position={[-4, 2, -5]} color="#FFE2E6" scale={3} speed={0.5} />
            <Blob position={[4, -2, -5]} color="#FF4757" scale={2.5} speed={0.4} />
            <Blob position={[0, 0, -8]} color="#FFFFFF" scale={4} speed={0.3} />

            {/* Smaller floating accents */}
            <Blob position={[-2, -3, -2]} color="#7BED9F" scale={0.8} speed={0.8} />
            <Blob position={[3, 3, -3]} color="#FFE2E6" scale={1.2} speed={0.6} />
        </>
    );
};

export default BlobBackground;
