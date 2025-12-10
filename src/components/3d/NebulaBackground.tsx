import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const NebulaBackground: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const { mouse } = useThree();

    // Particle count
    const count = 3000;

    // Custom Shaders
    const vertexShader = `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPixelRatio;
        
        attribute float aScale;
        attribute vec3 aRandomness;
        
        varying vec3 vColor;
        
        void main() {
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            
            // Base movement (drift)
            float time = uTime * 0.2;
            modelPosition.x += sin(time + modelPosition.y * 0.5) * 0.2;
            modelPosition.y += cos(time + modelPosition.x * 0.5) * 0.2;
            modelPosition.z += sin(time + modelPosition.x * 0.5) * 0.2;
            
            // Mouse Interaction (Attraction/Swirl)
            // Convert mouse to world space roughly (assuming z=0 plane for simplicity)
            vec3 mousePos = vec3(uMouse.x * 10.0, uMouse.y * 10.0, 0.0); // Scale mouse to match scene
            float dist = distance(modelPosition.xyz, mousePos);
            
            // Attraction force
            float force = max(0.0, 5.0 - dist); // Radius of influence
            vec3 direction = normalize(mousePos - modelPosition.xyz);
            
            // Apply force (move towards mouse)
            modelPosition.xyz += direction * force * 0.5 * sin(uTime); 
            
            // Swirl effect
            vec3 swirl = cross(direction, vec3(0.0, 0.0, 1.0));
            modelPosition.xyz += swirl * force * 0.2;

            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
            
            gl_Position = projectedPosition;
            
            // Size attenuation
            gl_PointSize = aScale * uPixelRatio;
            gl_PointSize *= (1.0 / -viewPosition.z);
            
            // Color variation based on position (Light Theme)
            vColor = mix(vec3(0.4, 0.6, 0.9), vec3(0.9, 0.5, 0.6), position.y * 0.1 + 0.5);
            // Add some white/brightness
            vColor += vec3(0.2);
        }
    `;

    const fragmentShader = `
        varying vec3 vColor;
        
        void main() {
            // Soft glow (circular gradient)
            float strength = distance(gl_PointCoord, vec2(0.5));
            strength = 1.0 - strength;
            strength = pow(strength, 3.0);
            
            // Final color
            vec3 color = vColor;
            
            gl_FragColor = vec4(color, strength);
        }
    `;

    // Geometry Data
    const { positions, scales, randomness } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const randomness = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Spread particles in a wide volume
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 10;

            scales[i] = Math.random();

            randomness[i3] = Math.random();
            randomness[i3 + 1] = Math.random();
            randomness[i3 + 2] = Math.random();
        }

        return { positions, scales, randomness };
    }, []);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2() },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    }), []);

    useFrame((state) => {
        const { clock } = state;
        if (pointsRef.current && pointsRef.current.material) {
            // @ts-ignore
            pointsRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
            // @ts-ignore
            pointsRef.current.material.uniforms.uMouse.value.set(mouse.x, mouse.y);
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
            </bufferGeometry>
            <shaderMaterial
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexColors
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </points>
    );
};

export default NebulaBackground;
