import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

export default function ParticleBackground() {
  const containerRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Configuration ---
    const CONFIG = {
      particleCount: window.innerWidth < 768 ? 800 : 2000,
      particleSize: window.innerWidth < 768 ? 0.05 : 0.035,
      terrainWidth: 50,
      terrainDepth: 50,
      waveSpeed: 0.5,
      mouseSensitivity: 0.0005
    };

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    
    // Define Colors based on Theme
    const isDark = theme === 'dark';
    const bgColor = isDark ? 0x0d1117 : 0xF9FBFA; // Matches --bg-main
    
    // Fog blends distant particles into the background color
    scene.fog = new THREE.FogExp2(bgColor, 0.03);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    camera.position.y = 3;
    camera.rotation.x = -0.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true, // Allow CSS background to show through if needed, but Fog is opaque usually
      antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(bgColor, 1); // Set clear color to background
    
    // Append to container
    // Clear previous if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // --- Particle Terrain ---
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const originalPositions = [];
    const originalX = [];
    const originalZ = [];
    const colors = [];

    const width = CONFIG.terrainWidth;
    const depth = CONFIG.terrainDepth;
    const count = CONFIG.particleCount;
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * width;
      const depthRange = 80;
      const zStart = -70;
      const z = zStart + (i / count) * depthRange + (Math.random() - 0.5) * 2; 
      const y = (Math.random() - 0.5) * 2;

      positions.push(x, y, z);
      originalPositions.push(y);
      originalX.push(x);
      originalZ.push(z);

      const color = new THREE.Color();
      const choice = Math.random();

      if (isDark) {
        // Original Dark Theme Colors (Bright/Neon)
        if (choice > 0.8)      color.setHSL(0.6, 0.9, 0.7); // Bright Blue
        else if (choice > 0.6) color.setHSL(0.8, 0.9, 0.7); // Bright Purple
        else if (choice > 0.4) color.setHSL(0.9, 0.9, 0.7); // Pink/Magenta
        else if (choice > 0.2) color.setHSL(0.5, 0.9, 0.7); // Cyan
        else                   color.setHSL(0.1, 0.9, 0.8); // Gold
      } else {
        // Light Theme Colors (Darker/Saturated for contrast against white)
        // Using MongoDB Green, Slate, Blue, etc.
        if (choice > 0.8)      color.setHex(0x00ED64); // MongoDB Green
        else if (choice > 0.6) color.setHex(0x001E2B); // Dark Slate
        else if (choice > 0.4) color.setHex(0x3D4F58); // Lighter Slate
        else if (choice > 0.2) color.setHex(0x2563EB); // Royal Blue
        else                   color.setHex(0x7C3AED); // Deep Purple
      }
      
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: CONFIG.particleSize,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.8 : 0.7, // Slightly less opaque in light mode
      blending: THREE.NormalBlending, // Additive is bad for light mode (makes things white)
      sizeAttenuation: true
    });

    if (isDark) {
        material.blending = THREE.AdditiveBlending; // Glowing effect for dark mode
    }

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- Interaction ---
    let mouseX = 0;
    let mouseY = 0;
    
    // Check if we can just use window scroll or need more complex handling
    let lastScrollY = window.scrollY;
    let currentScrollSpeed = 0;

    const handleMouseMove = (event) => {
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    };

    const handleScroll = () => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;
        currentScrollSpeed += delta * 0.005;
        
        // Clamp speed
        if (currentScrollSpeed > 0.5) currentScrollSpeed = 0.5;
        if (currentScrollSpeed < -0.5) currentScrollSpeed = -0.5;
        
        lastScrollY = currentY;
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        material.size = window.innerWidth < 768 ? 0.05 : 0.035;
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Decay scroll speed
      currentScrollSpeed *= 0.95;
      const baseSpeed = 0.02; // Constant forward movement
      const speed = baseSpeed + currentScrollSpeed;

      // Mouse Parallax
      const targetX = mouseX * CONFIG.mouseSensitivity;
      const targetY = mouseY * CONFIG.mouseSensitivity;

      particles.rotation.y += 0.001;
      particles.rotation.x += (targetY - particles.rotation.x) * 0.05;
      particles.rotation.z += (targetX - particles.rotation.z) * 0.05;

      const positions = particles.geometry.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Move Z forward
        positions[i3 + 2] += speed;

        // Reset loop
        if (positions[i3 + 2] > 10) {
           positions[i3 + 2] -= 80; 
        } else if (positions[i3 + 2] < -70) {
           positions[i3 + 2] += 80;
        }
        
        // Wave movement regeneration
        const ox = originalX[i];
        const oz = positions[i3 + 2];
        const oy = originalPositions[i];
        
        positions[i3 + 1] = oy + Math.sin(ox * 0.5 + elapsedTime * CONFIG.waveSpeed) * 0.5 + Math.cos(oz * 0.3 + elapsedTime * CONFIG.waveSpeed) * 0.5;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [theme]); // Re-run when theme changes to update colors fully

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[-1] pointer-events-none transition-colors duration-500"
      style={{ background: theme === 'dark' ? '#0d1117' : '#F9FBFA' }}
    />
  );
}
