import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function Particles({ count = 100 }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const light = useRef<THREE.PointLight>(null);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        const currentMesh = mesh.current;
        if (!currentMesh) return;

        // Light follows mouse
        if (light.current) {
            light.current.position.set(
                (state.mouse.x * 20),
                (state.mouse.y * 20),
                0
            )
        }

        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            particle.mx += (state.mouse.x * 100 - particle.mx) * 0.01;
            particle.my += (state.mouse.y * 100 - particle.my) * 0.01;

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            currentMesh.setMatrixAt(i, dummy.matrix);
        });
        currentMesh.instanceMatrix.needsUpdate = true;
    });

    return (
        <>
            <pointLight ref={light} distance={40} intensity={8} color="lightblue" />
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <dodecahedronGeometry args={[0.2, 0]} />
                <meshPhongMaterial color="#050505" />
            </instancedMesh>
        </>
    );
}

export default function ImmersiveBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 to-black">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={75} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <Particles count={150} />
                </Float>
            </Canvas>
        </div>
    );
}
