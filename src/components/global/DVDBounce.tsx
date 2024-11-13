"use client"

import React, { useEffect, useRef } from 'react';

type Props = {
    children: React.ReactNode;
    containerRef: React.RefObject<HTMLElement>;
}

const DVDBounce = ({ children, containerRef }: Props) => {
  const bounceRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 2, y: 2 });
  const previousTimeRef = useRef(0);

  useEffect(() => {
    const bounceElement = bounceRef.current;
    const container = containerRef.current;
    
    if (!bounceElement || !container) return;

    const animate = (currentTime: number) => {
      if (!previousTimeRef.current) previousTimeRef.current = currentTime;
      const deltaTime = (currentTime - previousTimeRef.current) / 16; // Normalize to ~60fps
      previousTimeRef.current = currentTime;

      const containerRect = container.getBoundingClientRect();
      const elementRect = bounceElement.getBoundingClientRect();

      // Update position based on velocity and deltaTime
      positionRef.current.x += velocityRef.current.x * deltaTime;
      positionRef.current.y += velocityRef.current.y * deltaTime;

      // Check for collisions with container boundaries
      if (positionRef.current.x + elementRect.width > containerRect.width) {
        positionRef.current.x = containerRect.width - elementRect.width;
        velocityRef.current.x *= -1;
      } else if (positionRef.current.x < 0) {
        positionRef.current.x = 0;
        velocityRef.current.x *= -1;
      }

      if (positionRef.current.y + elementRect.height > containerRect.height) {
        positionRef.current.y = containerRect.height - elementRect.height;
        velocityRef.current.y *= -1;
      } else if (positionRef.current.y < 0) {
        positionRef.current.y = 0;
        velocityRef.current.y *= -1;
      }

      // Apply the transformation
      bounceElement.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start the animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerRef]);

  return (
    <div
      ref={bounceRef}
      className="absolute transition-colors duration-300"
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  );
};

export default DVDBounce;