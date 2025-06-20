import React, { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const createBubbles = () => {
      const bubbleCount = 15;
      bubblesRef.current = [];
      
      for (let i = 0; i < bubbleCount; i++) {
        bubblesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 2,
          opacity: Math.random() * 0.6 + 0.2
        });
      }
    };

    const drawBubble = (bubble: Bubble) => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
      ctx.fill();
      
      // Add glow effect
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawConnections = () => {
      const maxDistance = 150;
      
      for (let i = 0; i < bubblesRef.current.length; i++) {
        for (let j = i + 1; j < bubblesRef.current.length; j++) {
          const bubble1 = bubblesRef.current[i];
          const bubble2 = bubblesRef.current[j];
          
          const dx = bubble1.x - bubble2.x;
          const dy = bubble1.y - bubble2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.3;
            
            ctx.beginPath();
            ctx.moveTo(bubble1.x, bubble1.y);
            ctx.lineTo(bubble2.x, bubble2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    const updateBubbles = () => {
      bubblesRef.current.forEach(bubble => {
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;
        
        // Bounce off edges
        if (bubble.x <= bubble.radius || bubble.x >= canvas.width - bubble.radius) {
          bubble.vx *= -1;
        }
        if (bubble.y <= bubble.radius || bubble.y >= canvas.height - bubble.radius) {
          bubble.vy *= -1;
        }
        
        // Keep bubbles within bounds
        bubble.x = Math.max(bubble.radius, Math.min(canvas.width - bubble.radius, bubble.x));
        bubble.y = Math.max(bubble.radius, Math.min(canvas.height - bubble.radius, bubble.y));
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      updateBubbles();
      drawConnections();
      
      bubblesRef.current.forEach(drawBubble);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createBubbles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createBubbles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
};
