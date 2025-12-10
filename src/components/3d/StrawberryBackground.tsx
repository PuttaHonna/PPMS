import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StrawberryBackground: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const count = 200;

    const vertexShader = `
        uniform float uTime;
        uniform float uPixelRatio;
        
        attribute float aScale;
        attribute vec3 aRandomness;
        attribute float aSpeed;
        
        varying vec2 vUv;
        varying float vRotation;

        void main() {
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            
            // Falling animation
            float fallOffset = uTime * aSpeed;
            modelPosition.y -= fallOffset;
            
            // Reset position (loop)
            // Assuming range is roughly -10 to 10 vertically
            float height = 20.0;
            modelPosition.y = mod(modelPosition.y + 10.0, height) - 10.0;
            
            // Horizontal drift
            modelPosition.x += sin(uTime * 0.5 + aRandomness.x * 10.0) * 0.5;
            modelPosition.z += cos(uTime * 0.3 + aRandomness.z * 10.0) * 0.5;

            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
            
            gl_Position = projectedPosition;
            
            gl_PointSize = aScale * uPixelRatio * 100.0;
            gl_PointSize *= (1.0 / -viewPosition.z);
            
            vRotation = uTime * aRandomness.y; // Rotate based on time
        }
    `;

    const fragmentShader = `
        varying float vRotation;
        
        void main() {
            // Rotate UVs
            vec2 uv = gl_PointCoord - 0.5;
            float s = sin(vRotation);
            float c = cos(vRotation);
            mat2 rot = mat2(c, -s, s, c);
            uv = rot * uv;
            uv += 0.5;

            // Strawberry Shape SDF-ish
            vec2 p = uv * 2.0 - 1.0; // -1 to 1
            
            // Heart/Strawberry shape approximation
            // x^2 + (y - sqrt(|x|))^2 = 1 is a heart
            // Let's try a simpler distortion
            float r = length(p);
            float angle = atan(p.x, p.y);
            
            // Shape mask
            // Wider top, pointy bottom
            float shape = 1.0 - smoothstep(0.4, 0.45, length(vec2(p.x, p.y - p.x*p.x*0.2 + 0.1)));
            
            if (shape < 0.1) discard;

            vec3 color = vec3(1.0, 0.2, 0.3); // Red body

            // Leaves (Green top)
            if (p.y > 0.4 && abs(p.x) < 0.4) {
                color = vec3(0.4, 0.8, 0.2);
            }
            
            // Seeds (Yellow dots)
            // Simple grid pattern
            vec2 seedUV = p * 5.0;
            vec2 seedGrid = fract(seedUV) - 0.5;
            if (length(seedGrid) < 0.2 && p.y < 0.4) {
                 color = vec3(1.0, 0.9, 0.2);
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const { positions, scales, randomness, speeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const randomness = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            positions[i3] = (Math.random() - 0.5) * 20; // X
            positions[i3 + 1] = (Math.random() - 0.5) * 20; // Y
            positions[i3 + 2] = (Math.random() - 0.5) * 10; // Z

            scales[i] = Math.random() * 0.5 + 0.5;

            randomness[i3] = Math.random();
            randomness[i3 + 1] = Math.random();
            randomness[i3 + 2] = Math.random();

            speeds[i] = Math.random() * 0.5 + 0.2; // Falling speed
        }

        return { positions, scales, randomness, speeds };
    }, []);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    }), []);

    useFrame((state) => {
        if (pointsRef.current && pointsRef.current.material) {
            // @ts-ignore
            pointsRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aScale"
                    count={count}
                    array={scales}
                    itemSize={1}
                    args={[scales, 1]}
                />
                <bufferAttribute
                    attach="attributes-aRandomness"
                    count={count}
                    array={randomness}
                    itemSize={3}
                    args={[randomness, 3]}
                />
                <bufferAttribute
                    attach="attributes-aSpeed"
                    count={count}
                    array={speeds}
                    itemSize={1}
                    args={[speeds, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                depthWrite={false}
                transparent
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </points>
    );
};

export default StrawberryBackground;
