import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTaskStore } from '../../store/useTaskStore';

const ReactiveTerrain = () => {
    const mesh = useRef<THREE.Mesh>(null!);
    const { mouse } = useThree();
    const { tasks } = useTaskStore();

    // Calculate urgency metric (Count of Urgent & Important tasks)
    const urgencyCount = useMemo(() => {
        return tasks.filter(t => t.isUrgent && t.isImportant && !t.completed).length;
    }, [tasks]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2() },
        uColor1: { value: new THREE.Color('#00bcd4') }, // Cyan (Calm)
        uColor2: { value: new THREE.Color('#ff3d00') }, // Red (Urgent)
        uUrgency: { value: 0 },
    }), []);

    useFrame((state) => {
        const { clock } = state;
        const material = mesh.current.material as THREE.ShaderMaterial;

        material.uniforms.uTime.value = clock.getElapsedTime();

        // Smooth mouse interpolation
        material.uniforms.uMouse.value.lerp(
            new THREE.Vector2(mouse.x, mouse.y),
            0.1
        );

        // Smooth urgency transition
        const targetUrgency = Math.min(urgencyCount / 5, 1.0); // Cap at 5 tasks for max effect
        material.uniforms.uUrgency.value = THREE.MathUtils.lerp(
            material.uniforms.uUrgency.value,
            targetUrgency,
            0.05
        );
    });

    const vertexShader = `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uUrgency;
        varying vec2 vUv;
        varying float vElevation;
        varying float vDist;

        // Simplex noise function (simplified for brevity)
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vUv = uv;
            vec3 pos = position;

            // Base wave
            float noise = snoise(pos.xy * 0.2 + uTime * 0.1);
            float elevation = noise * (1.0 + uUrgency * 2.0); // Higher waves when urgent

            // Mouse interaction
            vec3 mousePos = vec3(uMouse.x * 20.0, uMouse.y * 20.0, 0.0);
            float dist = distance(pos.xy, mousePos.xy);
            vDist = dist;
            
            float influence = smoothstep(8.0, 0.0, dist);
            elevation += sin(dist * 2.0 - uTime * 3.0) * influence * 1.5;

            pos.z += elevation;
            vElevation = elevation;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uUrgency;
        varying float vElevation;
        varying float vDist;

        void main() {
            // Mix colors based on elevation and urgency
            float mixStrength = (vElevation + 1.0) * 0.5;
            mixStrength += uUrgency * 0.5; // Shift to red when urgent
            
            vec3 color = mix(uColor1, uColor2, clamp(mixStrength, 0.0, 1.0));
            
            // Highlight mouse area
            float highlight = smoothstep(5.0, 0.0, vDist);
            color += vec3(0.2) * highlight;

            // Grid lines effect
            // float grid = step(0.98, fract(vElevation * 10.0));
            // color += vec3(grid * 0.2);

            gl_FragColor = vec4(color, 0.9);
        }
    `;

    return (
        <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[60, 60, 128, 128]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                wireframe={true}
                transparent
            />
        </mesh>
    );
};

export default ReactiveTerrain;
