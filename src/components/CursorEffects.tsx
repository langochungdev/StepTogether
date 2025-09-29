'use client';

import { useEffect } from 'react';

export default function CursorEffects() {
  useEffect(() => {
    // Create a rainbow cursor trail effect
    const colors = [
      '#ff0000', // red
      '#ff4500', // orange red
      '#ffa500', // orange
      '#ffff00', // yellow
      '#adff2f', // green yellow
      '#00ff00', // green
      '#00fa9a', // spring green
      '#00ffff', // cyan
      '#1e90ff', // dodger blue
      '#0000ff', // blue
      '#8a2be2', // blue violet
      '#ff00ff'  // magenta
    ];
    
    let colorIndex = 0;
    let trailElements: HTMLElement[] = [];

    const createTrail = (x: number, y: number) => {
      const trail = document.createElement('div');
      trail.style.cssText = `
        position: fixed;
        left: ${x - 4}px;
        top: ${y - 4}px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${colors[colorIndex % colors.length]};
        pointer-events: none;
        z-index: 9999;
        transition: all 0.6s ease-out;
        box-shadow: 0 0 8px ${colors[colorIndex % colors.length]};
      `;
      
      document.body.appendChild(trail);
      trailElements.push(trail);
      colorIndex++;

      // Animate fade out
      requestAnimationFrame(() => {
        trail.style.transform = 'scale(0)';
        trail.style.opacity = '0';
      });

      // Remove after animation
      setTimeout(() => {
        if (trail.parentNode) {
          trail.parentNode.removeChild(trail);
        }
        const index = trailElements.indexOf(trail);
        if (index > -1) {
          trailElements.splice(index, 1);
        }
      }, 600);

      // Limit number of trail elements for performance
      if (trailElements.length > 25) {
        const oldTrail = trailElements.shift();
        if (oldTrail && oldTrail.parentNode) {
          oldTrail.parentNode.removeChild(oldTrail);
        }
      }
    };

    let lastX = -1;
    let lastY = -1;
    
    const handleMouseMove = (e: MouseEvent) => {
      const distance = Math.sqrt(Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2));
      
      // Only create trail if mouse moved enough distance
      if (distance > 4) {
        createTrail(e.clientX, e.clientY);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    // Throttle mouse events for performance
    let ticking = false;
    const throttledMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleMouseMove(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    document.addEventListener('mousemove', throttledMouseMove);

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      
      // Clean up all remaining trail elements
      trailElements.forEach(trail => {
        if (trail.parentNode) {
          trail.parentNode.removeChild(trail);
        }
      });
      trailElements = [];
    };
  }, []);

  return null;
}