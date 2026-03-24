/**
 * ParticleLayer – React Three Fiber floating background particles.
 * Lazy-loaded (no SSR). Minimal particle count for performance.
 */
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function TealParticles() {
  const ref = useRef();
  const geometry = useMemo(() => {
    const count = 160;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.020;
    ref.current.rotation.x = Math.sin(t * 0.007) * 0.06;
    ref.current.position.y = Math.sin(t * 0.22) * 0.22;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#1BA098" size={0.055} transparent opacity={0.48} sizeAttenuation />
    </points>
  );
}

function GoldParticles() {
  const ref = useRef();
  const geometry = useMemo(() => {
    const count = 70;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = -t * 0.013;
    ref.current.rotation.z = Math.sin(t * 0.005) * 0.04;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#DEB992" size={0.042} transparent opacity={0.30} sizeAttenuation />
    </points>
  );
}

function WhiteParticles() {
  const ref = useRef();
  const geometry = useMemo(() => {
    const count = 50;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.008;
    ref.current.rotation.x = -t * 0.005;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#ffffff" size={0.030} transparent opacity={0.18} sizeAttenuation />
    </points>
  );
}

export default function ParticleLayer() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 70 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      dpr={[1, 1.5]}
    >
      <TealParticles />
      <GoldParticles />
      <WhiteParticles />
    </Canvas>
  );
}
