import confetti from 'canvas-confetti';

export const triggerCelebration = () => {
    const count = 200;
    const defaults = {
        colors: ['#4ade80', '#ffffff', '#fbbf24', '#22c55e'],
        shapes: ['circle', 'square'] as confetti.Shape[],
        ticks: 200,
        gravity: 0.8,
        scalar: 0.8,
        drift: 0,
        zIndex: 9999, // Force on top of everything
    };

    function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
        });
    }

    // Center Blast
    fire(0.25, {
        spread: 26,
        startVelocity: 55,
        origin: { y: 0.6, x: 0.5 },
    });

    fire(0.2, {
        spread: 60,
        origin: { y: 0.6, x: 0.5 },
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        origin: { y: 0.6, x: 0.5 },
    });

    // Left Side Cannon
    confetti({
        ...defaults,
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        startVelocity: 60,
    });

    // Right Side Cannon
    confetti({
        ...defaults,
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        startVelocity: 60,
    });
};
