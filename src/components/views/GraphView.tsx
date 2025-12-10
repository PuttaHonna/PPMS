import React, { useMemo, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import MissionStatus from '../tasks/MissionStatus';
import { useTaskStore } from '../../store/useTaskStore';
import { useNoteStore } from '../../store/useNoteStore';
import { extractLinks } from '../../utils/links';
import { useUIStore } from '../../store/useUIStore';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';

// Simple hook for window size if react-use is not available
const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = React.useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    React.useEffect(() => {
        function handleResize() {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
};

const GraphView: React.FC = () => {
    const { tasks, setFocusedTask } = useTaskStore();
    const { notes } = useNoteStore();
    const { width } = useWindowDimensions();
    const { setView } = useUIStore();

    const data = useMemo(() => {
        const nodes: any[] = [];
        const links: any[] = [];

        // Add tasks
        tasks.forEach((task) => {
            let color = '#3b82f6'; // Default Blue (Active)
            if (task.completed) color = '#10b981'; // Green (Done)
            else if (task.isUrgent) color = '#ef4444'; // Red (Urgent)

            nodes.push({
                id: task.id,
                name: task.title,
                group: 'task',
                val: 20, // Larger value for visual weight
                color: color,
                isUrgent: task.isUrgent,
                completed: task.completed
            });
        });

        // Add notes
        notes.forEach((note) => {
            nodes.push({
                id: note.id,
                name: note.title,
                group: 'note',
                val: 25,
                color: '#a855f7', // Purple
            });

            // Extract links from note content
            const linkedTitles = extractLinks(note.content);
            linkedTitles.forEach((linkedTitle) => {
                // Find target (task or note)
                const targetTask = tasks.find((t) => t.title.toLowerCase() === linkedTitle.toLowerCase());
                const targetNote = notes.find((n) => n.title.toLowerCase() === linkedTitle.toLowerCase());

                if (targetTask) {
                    links.push({
                        source: note.id,
                        target: targetTask.id,
                    });
                } else if (targetNote) {
                    links.push({
                        source: note.id,
                        target: targetNote.id,
                    });
                }
            });
        });

        return { nodes, links };
    }, [tasks, notes]);

    const handleNodeClick = (node: any) => {
        if (node.group === 'task') {
            setFocusedTask(node.id);
            setView('list');
        } else if (node.group === 'note') {
            setView('notes');
        }
    };

    const nodeThreeObject = useCallback((node: any) => {
        const group = new THREE.Group();

        // 1. The Core Sphere
        const geometry = new THREE.SphereGeometry(node.val / 4, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: node.color,
            roughness: 0.3,
            metalness: 0.8,
            emissive: node.color,
            emissiveIntensity: node.isUrgent ? 0.8 : 0.2
        });
        const sphere = new THREE.Mesh(geometry, material);
        group.add(sphere);

        // 2. Glow Effect (Outer transparent sphere)
        if (node.isUrgent || !node.completed) {
            const glowGeo = new THREE.SphereGeometry(node.val / 2.5, 32, 32);
            const glowMat = new THREE.MeshBasicMaterial({
                color: node.color,
                transparent: true,
                opacity: 0.15,
                side: THREE.BackSide
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            group.add(glow);
        }

        // 3. Text Label (Sprite)
        const sprite = new SpriteText(node.name);
        sprite.color = '#ffffff';
        sprite.textHeight = 4;
        sprite.position.y = node.val / 2 + 4; // Position above the sphere
        sprite.fontFace = 'Inter, system-ui, sans-serif';
        sprite.backgroundColor = 'rgba(0,0,0,0.5)'; // Semi-transparent background for readability
        sprite.padding = 2;
        sprite.borderRadius = 4;
        group.add(sprite);

        return group;
    }, []);



    return (
        <div className="h-full w-full rounded-3xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl relative">
            {/* Legend */}
            <div className="absolute top-4 left-4 z-10 bg-black/40 p-3 rounded-xl backdrop-blur-md border border-white/10 text-xs text-white/70 shadow-lg">
                <div className="font-bold text-white mb-2 uppercase tracking-wider opacity-50">Legend</div>
                <div className="flex items-center gap-2 mb-1.5"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> Urgent</div>
                <div className="flex items-center gap-2 mb-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> Active</div>
                <div className="flex items-center gap-2 mb-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Done</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span> Note</div>
            </div>

            {/* Mission Control HUD */}
            <MissionStatus className="absolute top-4 right-4 z-10 w-64 bg-black/40 backdrop-blur-md border-white/10" />

            <ForceGraph3D
                ref={(el) => {
                    if (el) {
                        // Set initial camera position (zoom out)
                        // The default is often too close. increasing Z moves it back.
                        el.cameraPosition({ x: 0, y: 0, z: 400 });
                    }
                }}
                graphData={data}
                nodeThreeObject={nodeThreeObject}
                linkColor={() => '#475569'} // Slate-600
                backgroundColor="rgba(0,0,0,0)"
                width={width > 1024 ? 800 : width - 40}
                height={600}
                linkOpacity={0.3}
                linkWidth={1.5}
                onNodeClick={handleNodeClick}
                showNavInfo={false}
                d3VelocityDecay={0.1} // Lower decay = more movement
                enableNodeDrag={true}
            />
        </div>
    );
};

export default GraphView;
