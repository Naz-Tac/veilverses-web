"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import type { CollectionSection, CollectionKey } from "@/types/vault";

type CinderellaVaultHomeProps = {
  collections: CollectionSection[];
};

type CursorSpark = {
  id: number;
  x: number;
  y: number;
};

type BurstState = {
  seed: number;
  position: [number, number, number];
  color: string;
};

type VaultSceneProps = {
  collections: CollectionSection[];
  isDoorOpen: boolean;
  hoveredKey: CollectionKey | null;
  focusKey: CollectionKey | null;
  burst: BurstState | null;
  onHover: (key: CollectionKey | null) => void;
  onDoorOpen: () => void;
  onSectionClick: (section: CollectionSection) => void;
  soundEnabled: boolean;
  onLoadReady: () => void;
};

type SceneControllerProps = {
  isDoorOpen: boolean;
  leftDoorRef: RefObject<THREE.Group | null>;
  rightDoorRef: RefObject<THREE.Group | null>;
  doorGlowRef: RefObject<THREE.Mesh | null>;
  cameraProgressRef: RefObject<number>;
  closedTargetRef: RefObject<THREE.Vector3>;
  insideTargetRef: RefObject<THREE.Vector3>;
  focusTargetRef: RefObject<THREE.Vector3 | null>;
  loadReadyRef: RefObject<boolean>;
  onLoadReady: () => void;
};

function useChime(soundEnabled: boolean) {
  return (type: "door" | "section") => {
    if (!soundEnabled || typeof window === "undefined") {
      return;
    }

    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.value = 0.0001;
    gain.connect(context.destination);

    const baseFrequency = type === "door" ? 720 : 980;
    const oscillatorOne = context.createOscillator();
    const oscillatorTwo = context.createOscillator();
    oscillatorOne.type = "sine";
    oscillatorTwo.type = "triangle";
    oscillatorOne.frequency.value = baseFrequency;
    oscillatorTwo.frequency.value = baseFrequency * 1.5;
    oscillatorOne.connect(gain);
    oscillatorTwo.connect(gain);
    oscillatorOne.start();
    oscillatorTwo.start();

    const now = context.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (type === "door" ? 2.2 : 1.2));
    oscillatorOne.frequency.exponentialRampToValueAtTime(baseFrequency * 0.84, now + 0.45);
    oscillatorTwo.frequency.exponentialRampToValueAtTime(baseFrequency * 1.18, now + 0.55);

    oscillatorOne.stop(now + (type === "door" ? 2.3 : 1.25));
    oscillatorTwo.stop(now + (type === "door" ? 2.3 : 1.25));
  };
}

function SceneController({
  isDoorOpen,
  leftDoorRef,
  rightDoorRef,
  doorGlowRef,
  cameraProgressRef,
  closedTargetRef,
  insideTargetRef,
  focusTargetRef,
  loadReadyRef,
  onLoadReady,
}: SceneControllerProps) {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const targetProgress = isDoorOpen ? 1 : 0;
    cameraProgressRef.current = THREE.MathUtils.lerp(cameraProgressRef.current, targetProgress, isDoorOpen ? 0.021 : 0.018);

    const targetCamera = focusTargetRef.current ?? new THREE.Vector3().lerpVectors(
      closedTargetRef.current,
      insideTargetRef.current,
      cameraProgressRef.current,
    );

    if (focusTargetRef.current) {
      camera.position.lerp(focusTargetRef.current, 0.075);
    } else {
      camera.position.lerp(targetCamera, 0.032);
    }
    camera.lookAt(0, 1.6 + cameraProgressRef.current * 0.12, 0);

    if (leftDoorRef.current && rightDoorRef.current) {
      const hinge = cameraProgressRef.current;
      leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(leftDoorRef.current.rotation.y, -Math.PI * 0.88 * hinge, 0.05);
      rightDoorRef.current.rotation.y = THREE.MathUtils.lerp(rightDoorRef.current.rotation.y, Math.PI * 0.88 * hinge, 0.05);
      leftDoorRef.current.position.x = THREE.MathUtils.lerp(leftDoorRef.current.position.x, -1.92 - hinge * 0.16, 0.04);
      rightDoorRef.current.position.x = THREE.MathUtils.lerp(rightDoorRef.current.position.x, 1.92 + hinge * 0.16, 0.04);
    }

    if (doorGlowRef.current) {
      const material = doorGlowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.18 + cameraProgressRef.current * 0.48 + Math.sin(t * 1.8) * 0.03;
    }

    if (!loadReadyRef.current && t > 0.25) {
      loadReadyRef.current = true;
      onLoadReady();
    }
  });

  return null;
}

function CursorTrail({ sparks }: { sparks: CursorSpark[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.span
            key={spark.id}
            initial={{ opacity: 0.95, scale: 0.35, x: spark.x, y: spark.y }}
            animate={{ opacity: 0, scale: 1.9, x: spark.x + 8, y: spark.y - 8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute left-0 top-0 block h-2 w-2 rounded-full bg-[radial-gradient(circle,rgba(255,248,214,1)_0%,rgba(201,168,76,0.9)_28%,rgba(201,168,76,0)_70%)] blur-[1px]"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function OpeningLogo({ isOpen }: { isOpen: boolean }) {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center px-4"
        >
          <div className="text-center">
            <motion.div
              animate={{ filter: ["drop-shadow(0 0 12px rgba(201,168,76,.35))", "drop-shadow(0 0 24px rgba(255,234,180,.75))", "drop-shadow(0 0 12px rgba(201,168,76,.35))"] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-[#d6b86e]/25 bg-black/10"
            >
              <div className="flex flex-col items-center">
                <div className="text-4xl font-semibold tracking-[0.28em] text-[#f7e2b6]">V&amp;V</div>
                <svg viewBox="0 0 80 110" className="mt-2 h-24 w-20">
                  <path d="M40 12 C33 26, 26 36, 22 51 C18 68, 20 90, 40 100 C60 90, 62 68, 58 51 C54 36, 47 26, 40 12 Z" fill="none" stroke="#d8b862" strokeWidth="2.4" />
                  <path d="M31 56 C36 49, 44 49, 49 56" fill="none" stroke="#f8e8bf" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M40 20 L40 56" stroke="#f8e8bf" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.45 }}
              className="mt-6 text-sm uppercase tracking-[0.48em] text-[#f3dfab]"
            >
              Your story begins here...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DoorCrescent({ side }: { side: "left" | "right" }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.position.y = Math.sin(t * 0.8 + (side === "left" ? 0 : 1.7)) * 0.015;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[3.95, 8.65, 0.22]} />
        <meshStandardMaterial color="#15110d" roughness={0.9} metalness={0.08} emissive="#8e6d1e" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0, 0.17]}>
        <boxGeometry args={[3.55, 8.25, 0.06]} />
        <meshStandardMaterial color="#241b13" roughness={0.76} metalness={0.16} />
      </mesh>
      <mesh position={[0, 0, 0.21]}>
        <boxGeometry args={[3.12, 7.82, 0.04]} />
        <meshBasicMaterial color="#c9a84c" transparent opacity={0.08} />
      </mesh>
      <mesh position={[0, 3.45, 0.24]}>
        <planeGeometry args={[2.5, 0.65]} />
        <meshBasicMaterial color="#d7bc71" transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, -3.25, 0.24]}>
        <planeGeometry args={[2.35, 0.55]} />
        <meshBasicMaterial color="#d7bc71" transparent opacity={0.1} />
      </mesh>
      <mesh position={[-1.23, 0, 0.28]}>
        <boxGeometry args={[0.12, 7.3, 0.12]} />
        <meshStandardMaterial color="#f0d690" roughness={0.2} metalness={0.95} />
      </mesh>
      <mesh position={[1.12, 0.2, 0.29]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#f3ddad" roughness={0.12} metalness={0.98} emissive="#c9a84c" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0.3]}>
        <cylinderGeometry args={[0.05, 0.11, 1.1, 18]} />
        <meshStandardMaterial color="#edd48c" roughness={0.15} metalness={0.98} />
      </mesh>
      <mesh position={[0, 0.9, 0.33]}>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshBasicMaterial color="#fff2c8" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.9, 0.38]}>
        <planeGeometry args={[2.5, 6.8]} />
        <meshBasicMaterial color="#f7e1aa" transparent opacity={0.05} />
      </mesh>
      <mesh position={[0, -0.5, 0.31]}>
        <torusGeometry args={[0.44, 0.03, 16, 36]} />
        <meshBasicMaterial color="#f6e2b2" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function DoorOpeningBursts() {
  const points = useMemo(() => {
    const array = new Float32Array(300 * 3);
    for (let index = 0; index < 300; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.8 + Math.random() * 0.7;
      array[index * 3] = Math.cos(angle) * radius;
      array[index * 3 + 1] = (Math.random() - 0.5) * 7.8;
      array[index * 3 + 2] = Math.sin(angle) * 0.25;
    }
    return array;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f7d978" size={0.06} transparent opacity={0.85} />
    </points>
  );
}

function DressRow({
  section,
  hovered,
}: {
  section: CollectionSection;
  hovered: boolean;
}) {
  const sway = hovered ? 0.08 : 0.03;
  const items = section.key === "quinceanera" ? 4 : section.key === "accessories" ? 3 : 3;
  const height = section.key === "prom-formal" ? 1.45 : section.key === "quinceanera" ? 1.95 : 1.65;
  const width = section.key === "quinceanera" ? 0.72 : 0.58;
  const baseColor = section.key === "quinceanera" ? "#e6a5b6" : section.key === "prom-formal" ? "#f5d7a2" : "#fbf8ef";

  return (
    <group position={[0, -0.5, 0.04]}>
      {Array.from({ length: items }, (_, index) => {
        const offset = (index - (items - 1) / 2) * 0.75;
        const phase = index * 0.72 + (section.key === "quinceanera" ? 0.35 : 0);
        return (
          <group key={index} position={[offset, 0, 0]} rotation={[0, 0, Math.sin(phase) * sway]}>
            <mesh position={[0, 0.88, 0]}>
              <torusGeometry args={[0.13, 0.025, 16, 24]} />
              <meshStandardMaterial color="#d9bb70" emissive="#9c7b2d" emissiveIntensity={hovered ? 0.4 : 0.14} metalness={0.95} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.78, 14]} />
              <meshStandardMaterial color="#efefe6" roughness={0.4} metalness={0.04} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <coneGeometry args={[width, height, section.key === "quinceanera" ? 8 : 7]} />
              <meshStandardMaterial color={baseColor} roughness={0.58} metalness={0.12} emissive={section.accent} emissiveIntensity={hovered ? 0.3 : 0.06} />
            </mesh>
            {section.key === "quinceanera" && (
              <mesh position={[0, -0.38, 0.05]}>
                <sphereGeometry args={[0.32, 18, 18]} />
                <meshStandardMaterial color="#f0bfd0" transparent opacity={0.6} emissive="#ffcee2" emissiveIntensity={0.12} />
              </mesh>
            )}
            {section.key === "accessories" && (
              <mesh position={[0.24, -0.18, 0.05]}>
                <boxGeometry args={[0.28, 0.18, 0.12]} />
                <meshStandardMaterial color="#ffffff" roughness={0.28} metalness={0.1} transparent opacity={0.7} />
              </mesh>
            )}
            {section.key === "prom-formal" && (
              <mesh position={[0, -0.4, 0.05]}>
                <boxGeometry args={[0.32, 0.18, 0.14]} />
                <meshStandardMaterial color="#fff3d1" roughness={0.25} metalness={0.08} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function WardrobeSection({
  section,
  hoveredKey,
  onHover,
  onClick,
  visible,
}: {
  section: CollectionSection;
  hoveredKey: CollectionKey | null;
  onHover: (value: CollectionKey | null) => void;
  onClick: (section: CollectionSection) => void;
  visible: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const isHovered = hoveredKey === section.key;

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    const t = clock.getElapsedTime();
    ref.current.position.y = section.position[1] + Math.sin(t * 1.1 + section.position[0]) * (isHovered ? 0.06 : 0.02);
    ref.current.rotation.z = Math.sin(t * 0.8 + section.position[0]) * (isHovered ? 0.018 : 0.009);
    ref.current.scale.setScalar(visible ? (isHovered ? 1.06 : 1) : 0.96);
  });

  const shelfGlow = section.key === "accessories" ? "#ffffff" : section.key === "quinceanera" ? "#f2b8ca" : section.key === "bridal" ? "#f5f0e2" : section.key === "prom-formal" ? "#f1cc8a" : "#f3f0e6";
  const panelGlow = section.key === "accessories" ? "#eceef9" : section.key === "quinceanera" ? "#e46a93" : section.key === "bridal" ? "#ffffff" : section.key === "prom-formal" ? "#f0be5d" : "#d8dbe9";
  const title = section.label;

  return (
    <group
      ref={ref}
      position={section.position}
      onPointerOver={() => onHover(section.key)}
      onPointerOut={() => onHover(null)}
      onClick={() => onClick(section)}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[section.size[0], section.size[1], section.size[2]]} />
        <meshStandardMaterial color={isHovered ? "#342818" : "#18120f"} roughness={0.86} metalness={0.08} emissive={section.accent} emissiveIntensity={isHovered ? 0.35 : 0.08} />
      </mesh>
      <mesh position={[0, 0, section.size[2] / 2 + 0.01]}>
        <planeGeometry args={[section.size[0] * 0.96, section.size[1] * 0.96]} />
        <meshBasicMaterial color={panelGlow} transparent opacity={isHovered ? 0.18 : 0.08} />
      </mesh>
      <mesh position={[0, section.size[1] / 2 - 0.16, 0.04]}>
        <planeGeometry args={[section.size[0] * 0.72, 0.22]} />
        <meshBasicMaterial color={shelfGlow} transparent opacity={isHovered ? 0.32 : 0.18} />
      </mesh>
      <mesh position={[0, -section.size[1] / 2 + 0.18, 0.04]}>
        <planeGeometry args={[section.size[0] * 0.72, 0.14]} />
        <meshBasicMaterial color={shelfGlow} transparent opacity={isHovered ? 0.25 : 0.14} />
      </mesh>

      {visible && <DressRow section={section} hovered={isHovered} />}

      <Html center position={[0, section.size[1] / 2 + 0.42, 0.08]} transform occlude>
        <motion.div
          animate={{
            scale: isHovered ? 1.04 : 1,
            boxShadow: isHovered ? "0 0 36px rgba(201,168,76,.3)" : "0 0 0 rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.25 }}
          className={`rounded-full border px-4 py-2 text-center uppercase tracking-[0.42em] backdrop-blur-sm transition ${isHovered ? "border-[#f1d993] bg-black/60 text-[#fff2c0]" : "border-white/15 bg-black/28 text-white/78"}`}
        >
          <div className="text-[10px] font-semibold">{title}</div>
          <div className="mt-1 text-[9px] tracking-[0.28em] text-[#f8e3b5]">24 styles →</div>
        </motion.div>
      </Html>

      <Html center position={[0, 0, section.size[2] / 2 + 0.18]} transform occlude>
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0.88 }}
          className={`rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.32em] ${isHovered ? "bg-[#c9a84c] text-black" : "bg-black/35 text-[#f1d993]"}`}
        >
          {section.description}
        </motion.div>
      </Html>
    </group>
  );
}

function VaultScene({
  collections,
  isDoorOpen,
  hoveredKey,
  focusKey,
  burst,
  onHover,
  onDoorOpen,
  onSectionClick,
  soundEnabled,
  onLoadReady,
}: VaultSceneProps) {
  const router = useRouter();
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const doorGlowRef = useRef<THREE.Mesh>(null);
  const cameraProgressRef = useRef(0);
  const closedTargetRef = useRef(new THREE.Vector3(0, 1.95, 12.2));
  const insideTargetRef = useRef(new THREE.Vector3(0, 1.95, 7.6));
  const focusTargetRef = useRef<THREE.Vector3 | null>(null);
  const loadReadyRef = useRef(false);
  const playChime = useChime(soundEnabled);

  useEffect(() => {
    if (focusKey) {
      const section = collections.find((item) => item.key === focusKey);
      focusTargetRef.current = section ? new THREE.Vector3(section.position[0], section.position[1] + 0.1, section.position[2] + 4.0) : null;
    } else {
      focusTargetRef.current = null;
    }
  }, [collections, focusKey]);

  useEffect(() => {
    if (isDoorOpen) {
      playChime("door");
    }
  }, [isDoorOpen, playChime]);

  const sectionBurst = burst ? <Sparkles key={burst.seed} count={burst.seed % 2 === 0 ? 160 : 120} scale={[2.4, 2.4, 2.4]} size={2} speed={0.4} color={burst.color} position={burst.position} /> : null;

  return (
    <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 1.95, 16.6], fov: 36 }}>
      <SceneController
        isDoorOpen={isDoorOpen}
        leftDoorRef={leftDoorRef}
        rightDoorRef={rightDoorRef}
        doorGlowRef={doorGlowRef}
        cameraProgressRef={cameraProgressRef}
        closedTargetRef={closedTargetRef}
        insideTargetRef={insideTargetRef}
        focusTargetRef={focusTargetRef}
        loadReadyRef={loadReadyRef}
        onLoadReady={onLoadReady}
      />
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 11, 28]} />
      <ambientLight intensity={0.08} color="#68501a" />
      <pointLight position={[0, 5.5, 2]} intensity={0.8} color="#f3cf82" />
      <spotLight position={[0, 7.4, 4]} angle={0.28} intensity={2.5} penumbra={0.55} color="#ffd98f" castShadow />
      <pointLight position={[-5, 1, 1]} intensity={0.45} color="#c9a84c" />
      <pointLight position={[5, 1, 1]} intensity={0.45} color="#c9a84c" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.72, 0]} receiveShadow>
        <planeGeometry args={[64, 64]} />
        <meshStandardMaterial color="#141111" roughness={0.42} metalness={0.44} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.71, 0.01]} receiveShadow>
        <planeGeometry args={[64, 64]} />
        <meshStandardMaterial color="#7f7261" roughness={0.12} metalness={0.55} transparent opacity={0.15} />
      </mesh>

      <group position={[0, 0, 0]}>
        <mesh position={[0, 4.55, 0.55]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 16]} />
          <meshStandardMaterial color="#fde8b2" emissive="#f8d782" emissiveIntensity={0.8} metalness={0.45} roughness={0.2} />
        </mesh>
        <mesh position={[0, 5.15, 0.58]}>
          <sphereGeometry args={[0.36, 28, 28]} />
          <meshStandardMaterial color="#fff4d1" emissive="#f6d57d" emissiveIntensity={1.15} metalness={0.12} roughness={0.12} />
        </mesh>
        <mesh position={[0, 5.12, 0.58]}>
          <sphereGeometry args={[0.78, 30, 30]} />
          <meshBasicMaterial color="#ffd779" transparent opacity={0.12} />
        </mesh>
        <mesh position={[0, 5.78, 0.54]}>
          <torusGeometry args={[1.25, 0.1, 18, 72]} />
          <meshStandardMaterial color="#ddc06c" emissive="#b88d2d" emissiveIntensity={0.35} metalness={0.95} roughness={0.12} />
        </mesh>
      </group>

      <group>
        <group ref={leftDoorRef} position={[-1.92, 0, 0]}>
          <DoorCrescent side="left" />
        </group>
        <group ref={rightDoorRef} position={[1.92, 0, 0]}>
          <DoorCrescent side="right" />
        </group>
      </group>

      <mesh ref={doorGlowRef} position={[0, 0, 0.2]}>
        <boxGeometry args={[4.2, 8.7, 0.06]} />
        <meshBasicMaterial color="#ffd97c" transparent opacity={0.2} />
      </mesh>

      <Html center position={[0, -0.28, 0.35]} transform occlude>
        <motion.button
          type="button"
          onClick={onDoorOpen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isDoorOpen ? 0 : 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="rounded-full border border-[#f4d978]/55 bg-black/30 px-8 py-3 text-[11px] uppercase tracking-[0.45em] text-[#f7e2b0] backdrop-blur-sm transition hover:bg-black/45"
        >
          Enter The Vault
        </motion.button>
      </Html>

      {sectionBurst}

      <mesh position={[0, 0, -5.35]}>
        <boxGeometry args={[10.4, 8.4, 0.06]} />
        <meshStandardMaterial color="#0f0e0d" roughness={0.92} metalness={0.06} transparent opacity={0.25} />
      </mesh>

      <mesh position={[0, 0, -5.28]}>
        <boxGeometry args={[10.1, 8.1, 0.05]} />
        <meshStandardMaterial color="#191410" roughness={0.82} metalness={0.1} transparent opacity={0.82} />
      </mesh>

      {isDoorOpen && collections.map((section) => (
        <WardrobeSection
          key={section.key}
          section={section}
          hoveredKey={hoveredKey}
          onHover={onHover}
          onClick={(clickedSection) => {
            focusTargetRef.current = new THREE.Vector3(clickedSection.position[0], clickedSection.position[1] + 0.35, clickedSection.position[2] + 4.3);
            onSectionClick(clickedSection);
            playChime("section");
            router.prefetch(clickedSection.route);
          }}
          visible={isDoorOpen}
        />
      ))}

      {isDoorOpen && (
        <Sparkles count={260} scale={[18, 10, 10]} size={1.8} speed={0.28} color="#f0cc72" />
      )}

      {burst && <DoorOpeningBursts key={burst.seed} />}
    </Canvas>
  );
}

export function CinderellaVaultHome({ collections }: CinderellaVaultHomeProps) {
  const router = useRouter();
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [isDoorOpening, setIsDoorOpening] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<CollectionKey | null>(null);
  const [focusKey, setFocusKey] = useState<CollectionKey | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cursorSparks, setCursorSparks] = useState<CursorSpark[]>([]);
  const [burst, setBurst] = useState<BurstState | null>(null);
  const sparkIdRef = useRef(0);
  const burstIdRef = useRef(0);
  const openTimeoutRef = useRef<number | null>(null);
  const routeTimeoutRef = useRef<number | null>(null);

  const onDoorOpen = () => {
    if (isDoorOpening || isDoorOpen) {
      return;
    }
    setIsDoorOpening(true);
    setBurst({ seed: burstIdRef.current += 1, position: [0, 0, 0.4], color: "#ffd977" });
    if (soundEnabled) {
      window.setTimeout(() => {
        const audio = new AudioContext();
        const gain = audio.createGain();
        const oscillator = audio.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = 920;
        oscillator.connect(gain);
        gain.connect(audio.destination);
        gain.gain.value = 0.0001;
        oscillator.start();
        gain.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 1.8);
        oscillator.stop(audio.currentTime + 1.85);
      }, 620);
    }
    openTimeoutRef.current = window.setTimeout(() => {
      setIsDoorOpen(true);
      setIsDoorOpening(false);
      setBurst(null);
    }, 3300);
  };

  const onSectionClick = (section: CollectionSection) => {
    setFocusKey(section.key);
    setBurst({ seed: burstIdRef.current += 1, position: section.position, color: section.accent });
    if (routeTimeoutRef.current) {
      window.clearTimeout(routeTimeoutRef.current);
    }
    routeTimeoutRef.current = window.setTimeout(() => {
      router.push(section.route);
    }, 900);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const nextId = sparkIdRef.current += 1;
      setCursorSparks((current) => {
        const next = [...current, { id: nextId, x: event.clientX, y: event.clientY }];
        return next.slice(-26);
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        window.clearTimeout(openTimeoutRef.current);
      }
      if (routeTimeoutRef.current) {
        window.clearTimeout(routeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      <CursorTrail sparks={cursorSparks} />
      <VaultScene
        collections={collections}
        isDoorOpen={isDoorOpen}
        hoveredKey={hoveredKey}
        focusKey={focusKey}
        burst={burst}
        onHover={setHoveredKey}
        onDoorOpen={onDoorOpen}
        onSectionClick={onSectionClick}
        soundEnabled={soundEnabled}
        onLoadReady={() => undefined}
      />
      <OpeningLogo isOpen={isDoorOpen} />

      <AnimatePresence>
        {!isDoorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex justify-center px-6 text-center"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.48em] text-[#e1c16c]">Your story begins here...</p>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">A fairy-tale wardrobe of bridal dreams opens with gold dust, marble reflections, and a magical glow.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-5 left-5 z-30 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-white/70 backdrop-blur-md">
        Pure black · Gold dust · Marble floor
      </div>

      <Link
        href="/find-my-dress"
        className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-[#c9a84c]/55 bg-black/30 px-5 py-2 text-[10px] uppercase tracking-[0.34em] text-[#f7e8bb] backdrop-blur-md"
      >
        Find My Dress AI
      </Link>

      <button
        type="button"
        onClick={() => setSoundEnabled((value) => !value)}
        className={`absolute bottom-5 right-5 z-30 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.34em] backdrop-blur-md transition ${soundEnabled ? "border-[#e3c05f] bg-[#c9a84c]/14 text-[#ffecc2]" : "border-white/10 bg-black/30 text-white/60"}`}
      >
        Magical music {soundEnabled ? "On" : "Off"}
      </button>
    </div>
  );
}
