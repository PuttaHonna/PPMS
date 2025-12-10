import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CyberpunkParticles = () => {
    const count = 5000;
    const mesh = useRef<THREE.Points>(null!);
    const { mouse } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2() },
        uColor1: { value: new THREE.Color('#ff9800') }, // Orange
        uColor2: { value: new THREE.Color('#f44336') }, // Red
    }), []);

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const randoms = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            randoms[i] = Math.random();
        }
        return { positions, randoms };
    }, []);

    useFrame((state) => {
        const { clock } = state;
        const material = mesh.current.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = clock.getElapsedTime();

        // Smooth mouse interpolation
        material.uniforms.uMouse.value.lerp(
            new THREE.Vector2(mouse.x, mouse.y),
            0.1
        );
    });

    const vertexShader = `
        uniform float uTime;
        uniform vec2 uMouse;
        attribute float aRandom;
        varying vec3 vColor;
        varying float vDistance;

        void main() {
            vec3 pos = position;
            
            // Rotate entire field slowly
            float angle = uTime * 0.05;
            mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            pos.xy = rot * pos.xy;

            // Mouse interaction: Repel particles
            // Map mouse -1..1 to world space roughly
            vec3 mousePos = vec3(uMouse.x * 10.0, uMouse.y * 10.0, 0.0);
            float dist = distance(pos, mousePos);
            float influence = smoothstep(5.0, 0.0, dist);
            
            // Push away from mouse
            vec3 dir = normalize(pos - mousePos);
            pos += dir * influence * 2.0;

            // Wave effect
            pos.z += sin(uTime * 2.0 + pos.x * 0.5) * 0.5;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            // Size attenuation
            gl_PointSize = (4.0 * aRandom + 2.0) * (1.0 / -mvPosition.z);

            vDistance = dist;
        }
    `;

    const fragmentShader = `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying float vDistance;
        varying vec3 vColor;

        void main() {
            // Circular particle
            float r = distance(gl_PointCoord, vec2(0.5));
            if (r > 0.5) discard;

            // Glow effect
            float glow = 1.0 - (r * 2.0);
            glow = pow(glow, 1.5);

            // Color mixing based on distance to mouse
            vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 5.0, vDistance));
            
            // Output with alpha for blending
            gl_FragColor = vec4(color, glow * 0.8); // Slightly transparent
        }
    `;

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particles.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    args={[particles.randoms, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.NormalBlending}
            />
        </points>
    );
};

const CyberpunkGrid = () => {
    return (
        <gridHelper
            args={[30, 30, 0xe91e63, 0x00bcd4]}
            position={[0, -5, 0]}
            rotation={[0, 0, 0]}
        />
    );
};

export default function CyberpunkBackground() {
    return (
        <group>
            <color attach="background" args={['#f0f2f5']} /> {/* Light Gray Background */}
            <CyberpunkParticles />
            <CyberpunkGrid />
            <fog attach="fog" args={['#f0f2f5', 5, 20]} />
        </group>
    );
}
