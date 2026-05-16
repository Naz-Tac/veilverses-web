"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";

type CategoryNodeProps = {
  x: number;
  phase: number;
};

function CategoryNode({ x, phase }: CategoryNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c9a84c",
        emissive: "#7a6122",
        emissiveIntensity: 1.2,
        metalness: 0.85,
        roughness: 0.25,
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }

    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.55 + phase;
    meshRef.current.position.y = 0.8 + Math.sin(t * 1.35 + phase) * 0.22;

    if (glowRef.current) {
      glowRef.current.rotation.z = t * 0.6 + phase;
      (glowRef.current.material as THREE.MeshStandardMaterial).opacity = 0.35 + Math.sin(t * 2.2 + phase) * 0.12;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={meshRef} material={material} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 2.5, 48]} />
      </mesh>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.7}>
        <mesh ref={glowRef} position={[0, 2.0, 0]}>
          <torusGeometry args={[0.58, 0.06, 18, 48]} />
          <meshBasicMaterial color="#f8d479" transparent opacity={0.35} />
        </mesh>
      </Float>
    </group>
  );
}

const categories = ["Bridal", "Quinceanera", "Prom & Formal", "Evening"] as const;

export default function BridalExperience() {

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-[#c9a84c]/35 bg-[#080808] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      <Canvas camera={{ position: [0, 3, 8], fov: 43 }} shadows>
        <color attach="background" args={["#070707"]} />
        <fog attach="fog" args={["#070707", 7, 16]} />
        <ambientLight intensity={0.45} />
        <spotLight
          position={[0, 9, 3]}
          intensity={2.6}
          angle={0.42}
          penumbra={0.4}
          color="#f3d989"
          castShadow
        />
        <pointLight position={[0, 2.5, 2.6]} intensity={1.4} color="#d8b252" />

        {categories.map((category, index) => (
          <CategoryNode
            key={category}
            x={(index - 1.5) * 1.9}
            phase={index * 0.8}
          />
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[26, 26]} />
          <meshStandardMaterial color="#101010" roughness={0.9} metalness={0.1} />
        </mesh>

        <Sparkles count={180} size={1.8} scale={[14, 5, 8]} speed={0.4} color="#d6bd72" />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.6}
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {categories.map((category) => (
          <div
            key={category}
            className="rounded-md border border-[#c9a84c]/45 bg-black/45 px-3 py-1.5 text-center text-[11px] uppercase tracking-[0.14em] text-[#f7e5b3]"
          >
            {category}
          </div>
        ))}
      </div>
    </div>
  );
}
