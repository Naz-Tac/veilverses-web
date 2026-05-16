"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Sparkles } from "@react-three/drei";
import type { CollectionKey, CollectionSection } from "@/types/vault";

type VaultHomeProps = {
  collections: CollectionSection[];
};

const CURRENCY = new Intl.NumberFormat("en-US");

function FloatingDust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(350 * 3);
    for (let index = 0; index < 350; index += 1) {
      data[index * 3] = (Math.random() - 0.5) * 18;
      data[index * 3 + 1] = Math.random() * 10 + 1;
      data[index * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#dcbf6a" size={0.035} transparent opacity={0.65} />
    </points>
  );
}

function WardrobeDoor({
  open,
  opening,
  onToggle,
}: {
  open: boolean;
  opening: boolean;
  onToggle: () => void;
}) {
  const doorRef = useRef<THREE.Group>(null);
  const panelRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (doorRef.current) {
      const targetRotation = open ? -Math.PI * 0.72 : 0;
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, targetRotation, 0.04);
      doorRef.current.position.z = THREE.MathUtils.lerp(doorRef.current.position.z, open ? 0.85 : 0, 0.04);
    }

    if (panelRef.current) {
      panelRef.current.rotation.z = Math.sin(t * 0.3) * 0.002;
    }

    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.28 + Math.sin(t * 1.5) * 0.08;
    }
  });

  return (
    <group>
      <group ref={doorRef} position={[-0.05, 0, 0.02]} onClick={onToggle}>
        <mesh ref={panelRef} position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 7.2, 0.42]} />
          <meshStandardMaterial color="#1a1713" roughness={0.84} metalness={0.08} />
        </mesh>
        <mesh position={[0, 0, 0.24]}>
          <planeGeometry args={[3.78, 6.86]} />
          <meshStandardMaterial color="#281f17" roughness={0.7} metalness={0.12} />
        </mesh>
        <mesh position={[0, 0, 0.31]}>
          <planeGeometry args={[3.5, 6.55]} />
          <meshBasicMaterial color="#c9a84c" transparent opacity={0.12} />
        </mesh>
        <mesh position={[-0.58, 0.5, 0.34]}>
          <cylinderGeometry args={[0.18, 0.22, 5.9, 24]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.95} roughness={0.18} />
        </mesh>
        <mesh position={[0.9, 0.25, 0.36]}>
          <boxGeometry args={[0.16, 2.1, 0.08]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.95} roughness={0.18} />
        </mesh>
        <mesh position={[-0.02, 0.95, 0.41]}>
          <planeGeometry args={[2.25, 1.35]} />
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.08} />
        </mesh>
        <mesh position={[0, 0.92, 0.42]}>
          <planeGeometry args={[1.9, 1.1]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.1} emissive="#c9a84c" emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[0, 0.92, 0.44]}>
          <planeGeometry args={[1.5, 0.58]} />
          <meshStandardMaterial color="#f6f0e1" transparent opacity={0.95} />
        </mesh>
        <mesh position={[0, 0.78, 0.45]}>
          <planeGeometry args={[1.62, 0.82]} />
          <meshBasicMaterial color="#d8bc71" transparent opacity={0.15} />
        </mesh>
      </group>

      <mesh ref={glowRef} position={[0, 0, -0.01]}>
        <boxGeometry args={[4.7, 7.6, 0.05]} />
        <meshBasicMaterial color="#d6ba68" transparent opacity={0.22} />
      </mesh>

      <Html center position={[0, 0.78, 0.55]} transform occlude>
        <div className="select-none text-center text-white drop-shadow-[0_0_18px_rgba(255,226,142,0.75)]">
          <div className="text-[14px] uppercase tracking-[0.5em] text-[#f3e1ab]">V&V</div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.42em] text-[#ffffff] opacity-85">
            bridal silhouette
          </div>
        </div>
      </Html>
      <Html center position={[0, -2.55, 0.55]} transform>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full border border-[#f0d58a]/60 bg-black/30 px-5 py-2 text-xs uppercase tracking-[0.35em] text-[#f8e6b6] backdrop-blur-sm transition hover:bg-black/45"
        >
          {opening ? "Opening..." : open ? "Vault Open" : "Enter The Vault"}
        </button>
      </Html>
    </group>
  );
}
function Scene({ collections }: { collections: CollectionSection[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [activeSection, setActiveSection] = useState<CollectionKey | null>(null);
  const [hoveredSection, setHoveredSection] = useState<CollectionKey | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const cameraGroup = useRef<THREE.Group>(null);
  const insideTarget = useMemo(() => new THREE.Vector3(0, 1.8, 5.8), []);
  const closedTarget = useMemo(() => new THREE.Vector3(0, 1.95, 11.7), []);
  const cameraPosition = useMemo(() => new THREE.Vector3(0, 2.2, 13.5), []);
  const [cameraInside, setCameraInside] = useState(false);

  useFrame(({ camera, clock }) => {
    const elapsed = clock.getElapsedTime();
    const target = open ? insideTarget : closedTarget;
    camera.position.lerp(target, open ? 0.035 : 0.03);
    camera.lookAt(0, open ? 1.55 : 1.9, 0);

    if (cameraGroup.current) {
      cameraGroup.current.rotation.y = THREE.MathUtils.lerp(cameraGroup.current.rotation.y, open ? 0.02 : 0, 0.05);
      cameraGroup.current.position.z = THREE.MathUtils.lerp(cameraGroup.current.position.z, open ? -0.65 : 0, 0.04);
    }

    if (elapsed > 2.2 && !open) {
      cameraPosition.lerpVectors(cameraPosition, closedTarget, 0.02);
    }

    if (open && !cameraInside && camera.position.distanceTo(insideTarget) < 0.4) {
      setCameraInside(true);
    }
  });

  const toggleDoor = () => {
    if (opening || open) return;
    setOpening(true);
    setTimeout(() => {
      setOpen(true);
      setOpening(false);
    }, 2600);
  };

  const navigateTo = (section: CollectionSection) => {
    setActiveSection(section.key);
    setHoveredSection(section.key);
    const zoomMs = open ? 850 : 900;
    if (!open) {
      toggleDoor();
    }
    window.setTimeout(() => {
      router.push(section.route);
    }, zoomMs);
  };

  const activeOverlay = useMemo(() => {
    const section = collections.find((entry) => entry.key === (hoveredSection ?? activeSection)) ?? collections[0];
    return section;
  }, [activeSection, collections, hoveredSection]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#070605] text-white">
      <Canvas
        shadows
        dpr={[1, 1.8]}
        camera={{ position: [0, 2.2, 13.5], fov: 34 }}
        onPointerMissed={() => setHoveredSection(null)}
      >
        <color attach="background" args={["#070605"]} />
        <fog attach="fog" args={["#070605", 10, 26]} />
        <ambientLight intensity={0.22} color="#91773a" />
        <directionalLight position={[0, 8, 7]} intensity={1.6} color="#ffe7a8" />
        <spotLight position={[0, 7.8, 2]} angle={0.32} intensity={2.4} color="#f0d88b" penumbra={0.45} castShadow />
        <pointLight position={[-4, 2, 5]} intensity={0.8} color="#b88e31" />
        <pointLight position={[4, 2, 5]} intensity={0.8} color="#b88e31" />

        <group ref={cameraGroup}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.7, 0]} receiveShadow>
            <planeGeometry args={[70, 70]} />
            <meshStandardMaterial color="#2b2621" roughness={0.32} metalness={0.22} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.69, 0.02]} receiveShadow>
            <planeGeometry args={[70, 70]} />
            <meshStandardMaterial color="#8b8378" transparent opacity={0.15} roughness={0.12} metalness={0.4} />
          </mesh>

          <FloatingDust />

          <mesh position={[0, 0, -0.32]}>
            <boxGeometry args={[6.1, 9.6, 0.14]} />
            <meshStandardMaterial color="#100f0d" roughness={1} metalness={0.04} />
          </mesh>
          <mesh position={[0, 0, -0.28]}>
            <boxGeometry args={[5.82, 9.12, 0.1]} />
            <meshStandardMaterial color="#1b1815" roughness={0.8} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0, -0.24]}>
            <boxGeometry args={[5.62, 8.85, 0.06]} />
            <meshBasicMaterial color="#c9a84c" transparent opacity={0.08} />
          </mesh>

          <mesh position={[0, 4.1, 0.28]} castShadow>
            <boxGeometry args={[5.9, 0.42, 0.16]} />
            <meshStandardMaterial color="#1a1510" roughness={0.8} metalness={0.12} />
          </mesh>
          <mesh position={[0, 4.31, 0.35]}>
            <torusGeometry args={[2.5, 0.08, 12, 80]} />
            <meshStandardMaterial color="#c9a84c" metalness={0.95} roughness={0.16} emissive="#9b7424" emissiveIntensity={0.4} />
          </mesh>

          <WardrobeDoor open={open} opening={opening} onToggle={toggleDoor} />

          <mesh position={[0, -3.1, -0.7]} rotation={[0, 0, 0]} receiveShadow>
            <cylinderGeometry args={[5.1, 5.1, 0.06, 64]} />
            <meshStandardMaterial color="#a79b89" roughness={0.1} metalness={0.72} transparent opacity={0.22} />
          </mesh>

          {open && (
            <group position={[0, 0.1, -5.6]}>
              <group position={[0, 3.1, 0]}>
                <SectionPanel
                  section={collections[0]}
                  hovered={hoveredSection === collections[0].key}
                  onHover={setHoveredSection}
                  onClick={navigateTo}
                  railType="top"
                />
              </group>
              <SectionPanel
                section={collections[1]}
                hovered={hoveredSection === collections[1].key}
                onHover={setHoveredSection}
                onClick={navigateTo}
                railType="left"
                position={[-2.3, -0.5, 0]}
              />
              <SectionPanel
                section={collections[2]}
                hovered={hoveredSection === collections[2].key}
                onHover={setHoveredSection}
                onClick={navigateTo}
                railType="center"
                position={[0, -0.5, 0]}
              />
              <SectionPanel
                section={collections[3]}
                hovered={hoveredSection === collections[3].key}
                onHover={setHoveredSection}
                onClick={navigateTo}
                railType="right"
                position={[2.3, -0.5, 0]}
              />
              <SectionPanel
                section={collections[4]}
                hovered={hoveredSection === collections[4].key}
                onHover={setHoveredSection}
                onClick={navigateTo}
                railType="bottom"
                position={[0, -2.85, 0]}
              />
            </group>
          )}

          <Sparkles count={220} scale={[18, 9, 10]} size={1.7} speed={0.25} color="#e2c66b" />
          <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 3.2} />
        </group>
      </Canvas>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, ease: "easeOut" }}
        className="pointer-events-none absolute inset-x-0 top-8 z-20 flex justify-center px-4"
      >
        <div className="rounded-full border border-[#d8bf77]/40 bg-black/20 px-5 py-2 text-[10px] uppercase tracking-[0.42em] text-[#f2dfac] backdrop-blur-sm">
          Veil & Verses Private Showroom
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 1.1, delay: 0.35 }}
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="text-xs uppercase tracking-[0.55em] text-[#d9c27f]"
          >
            Enter The Vault
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.55 }}
            className="mt-4 max-w-[13ch] text-5xl leading-[0.95] text-white md:text-7xl"
          >
            The Vault
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 1.0, delay: 1.1 }}
            className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#f0e1bf]"
          >
            Walk into a private wardrobe of bridal dreams, warm light, polished marble, and hidden collections.
          </motion.p>
          <motion.button
            type="button"
            onClick={toggleDoor}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.25 }}
            className="pointer-events-auto mt-8 rounded-full border border-[#d9bd66]/60 bg-black/35 px-8 py-3 text-xs uppercase tracking-[0.45em] text-[#f8e8b8] backdrop-blur-md transition hover:bg-black/55"
          >
            Enter The Vault
          </motion.button>
        </div>
      </motion.div>

      <div className="absolute bottom-6 left-6 z-20 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setSoundEnabled((value) => !value)}
          className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.38em] backdrop-blur-md transition ${soundEnabled ? "border-[#e3c05f] bg-[#c9a84c]/15 text-[#ffeec0]" : "border-white/15 bg-black/30 text-white/70"}`}
        >
          Ambient Sound {soundEnabled ? "On" : "Off"}
        </button>
        <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-white/70 backdrop-blur-md">
          Marble floor · Gold light · 3D wardrobe
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-20 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-white/70 backdrop-blur-md">
        {open ? (cameraInside ? "Inside The Vault" : "Crossing The Threshold") : "Closed Door"}
      </div>

      {open && activeOverlay && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-full border border-[#e6cb7a]/35 bg-black/30 px-5 py-2 text-[10px] uppercase tracking-[0.42em] text-[#f5e7bc] backdrop-blur-md"
        >
          {activeOverlay.label} · {CURRENCY.format(activeOverlay.itemCount)} styles
        </motion.div>
      )}
    </div>
  );
}

function SectionPanel({
  section,
  hovered,
  onHover,
  onClick,
  railType,
  position = [0, 0, 0],
}: {
  section: CollectionSection;
  hovered: boolean;
  onHover: (value: CollectionKey | null) => void;
  onClick: (section: CollectionSection) => void;
  railType: "top" | "left" | "center" | "right" | "bottom";
  position?: [number, number, number];
}) {
  const railColor = hovered ? "#f0d28b" : "#80663a";
  const glow = hovered ? 0.55 : 0.15;

  return (
    <group position={position} scale={hovered ? 1.03 : 1} onPointerOver={() => onHover(section.key)} onPointerOut={() => onHover(null)} onClick={() => onClick(section)}>
      <mesh position={[0, railType === "top" ? 1.18 : 1.02, 0.02]}>
        <boxGeometry args={[railType === "bottom" ? 2.1 : 2.6, 0.08, 0.08]} />
        <meshStandardMaterial color={railColor} metalness={0.95} roughness={0.18} emissive="#b3882e" emissiveIntensity={glow} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[2.2, railType === "bottom" ? 1.4 : 2.3, 0.28]} />
        <meshStandardMaterial
          color={hovered ? "#302218" : "#1a1713"}
          roughness={0.68}
          metalness={0.08}
          emissive={hovered ? section.accent : "#000000"}
          emissiveIntensity={glow}
        />
      </mesh>
      <mesh position={[0, 0.17, 0.02]}>
        <boxGeometry args={[2.0, railType === "bottom" ? 1.2 : 2.0, 0.04]} />
        <meshBasicMaterial color={section.accent} transparent opacity={hovered ? 0.16 : 0.06} />
      </mesh>
      <mesh position={[0, -1.1, 0.04]}>
        <planeGeometry args={[1.8, 0.55]} />
        <meshStandardMaterial color="#f4f1e5" transparent opacity={hovered ? 0.3 : 0.14} />
      </mesh>
      <Html center position={[0, 0.75, 0.45]} transform occlude>
        <div className={`rounded-2xl border px-4 py-3 text-center backdrop-blur-sm transition ${hovered ? "border-[#e2c66b] bg-black/60 shadow-[0_0_34px_rgba(201,168,76,0.28)]" : "border-white/10 bg-black/30"}`}>
          <div className="text-[10px] uppercase tracking-[0.42em] text-[#f8e6b3]">{section.label}</div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.28em] text-white/75">{section.description}</div>
          <div className="mt-2 inline-flex rounded-full border border-[#e6cb7a]/35 bg-black/30 px-2.5 py-1 text-[9px] uppercase tracking-[0.28em] text-[#f8e8b8]">24 styles</div>
        </div>
      </Html>
    </group>
  );
}

const TheVault = dynamic(() => Promise.resolve(Scene), { ssr: false });

export function VaultHome({ collections }: VaultHomeProps) {
  return <TheVault collections={collections} />;
}
