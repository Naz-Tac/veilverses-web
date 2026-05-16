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
      leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(leftDoorRef.current.rotation.y, -Math.PI * 0.72 * hinge, 0.05);
      rightDoorRef.current.rotation.y = THREE.MathUtils.lerp(rightDoorRef.current.rotation.y, Math.PI * 0.72 * hinge, 0.05);
      leftDoorRef.current.position.x = THREE.MathUtils.lerp(leftDoorRef.current.position.x, -1.34 - hinge * 0.1, 0.04);
      rightDoorRef.current.position.x = THREE.MathUtils.lerp(rightDoorRef.current.position.x, 1.34 + hinge * 0.1, 0.04);
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
            initial={{ opacity: 0.55, scale: 0.25, x: spark.x, y: spark.y }}
            animate={{ opacity: 0, scale: 1.2, x: spark.x + 5, y: spark.y - 5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: "easeOut" }}
            className="absolute left-0 top-0 block h-1.5 w-1.5 rounded-full bg-[radial-gradient(circle,rgba(250,236,198,0.9)_0%,rgba(176,140,64,0.45)_35%,rgba(176,140,64,0)_74%)] blur-[0.5px]"
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
              animate={{ filter: ["drop-shadow(0 0 8px rgba(178,140,62,.22))", "drop-shadow(0 0 14px rgba(230,200,136,.35))", "drop-shadow(0 0 8px rgba(178,140,62,.22))"] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#c5a76a]/20 bg-black/18"
            >
              <div className="flex flex-col items-center">
                <div className="text-[44px] leading-none font-medium italic tracking-[0.03em] text-[#f3ddb1] [font-family:'Snell_Roundhand','Apple_Chancery','URW_Chancery_L',cursive]">V&amp;V</div>
                <div className="mt-1 h-px w-16 bg-gradient-to-r from-transparent via-[#c9a84c]/70 to-transparent" />
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.45 }}
              className="mt-5 text-[10px] uppercase tracking-[0.4em] text-[#d8bc82]/88"
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
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[2.78, 6.3, 0.16]} />
        <meshStandardMaterial color="#120f0d" roughness={0.92} metalness={0.05} emissive="#7f6122" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[2.6, 6.08, 0.05]} />
        <meshStandardMaterial color="#1d1713" roughness={0.84} metalness={0.11} />
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <boxGeometry args={[2.36, 5.82, 0.03]} />
        <meshBasicMaterial color="#c8a35b" transparent opacity={0.045} />
      </mesh>
      <mesh position={[0, 2.58, 0.15]}>
        <planeGeometry args={[1.86, 0.18]} />
        <meshBasicMaterial color="#d7bc71" transparent opacity={0.14} />
      </mesh>
      <mesh position={[0, -2.58, 0.15]}>
        <planeGeometry args={[1.72, 0.14]} />
        <meshBasicMaterial color="#d7bc71" transparent opacity={0.11} />
      </mesh>
      <mesh position={[-0.82, 0, 0.16]}>
        <boxGeometry args={[0.04, 5.28, 0.06]} />
        <meshStandardMaterial color="#e2c278" roughness={0.34} metalness={0.9} />
      </mesh>
      <mesh position={[0.86, 0.06, 0.2]}>
        <sphereGeometry args={[0.08, 20, 20]} />
        <meshStandardMaterial color="#f0dcb0" roughness={0.22} metalness={0.92} emissive="#c9a84c" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.17]}>
        <planeGeometry args={[2.22, 5.6]} />
        <meshBasicMaterial color="#f7e1aa" transparent opacity={0.026} />
      </mesh>
    </group>
  );
}

function DoorOpeningBursts() {
  const points = useMemo(() => {
    const array = new Float32Array(160 * 3);
    for (let index = 0; index < 160; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.9 + Math.random() * 0.5;
      array[index * 3] = Math.cos(angle) * radius;
      array[index * 3 + 1] = (Math.random() - 0.5) * 5.6;
      array[index * 3 + 2] = Math.sin(angle) * 0.25;
    }
    return array;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d8ba79" size={0.032} transparent opacity={0.5} />
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
    <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 1.95, 17.4], fov: 33 }}>
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
      <color attach="background" args={["#070605"]} />
      <fog attach="fog" args={["#070605", 12.5, 31]} />
      <ambientLight intensity={0.06} color="#584728" />
      <pointLight position={[0, 5.1, 2.4]} intensity={0.45} color="#d6b77c" />
      <spotLight position={[0, 7, 4.8]} angle={0.21} intensity={1.4} penumbra={0.62} color="#e7ca94" castShadow />
      <pointLight position={[-5, 1, 1]} intensity={0.22} color="#b59452" />
      <pointLight position={[5, 1, 1]} intensity={0.22} color="#b59452" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.72, 0]} receiveShadow>
        <planeGeometry args={[64, 64]} />
        <meshStandardMaterial color="#100e0d" roughness={0.52} metalness={0.34} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.71, 0.01]} receiveShadow>
        <planeGeometry args={[64, 64]} />
        <meshStandardMaterial color="#5f5245" roughness={0.16} metalness={0.42} transparent opacity={0.08} />
      </mesh>

      <group position={[0, 0, 0]} scale={[0.7, 0.7, 0.7]}>
        <mesh position={[0, 3.95, 0.3]}>
          <cylinderGeometry args={[0.015, 0.015, 0.34, 14]} />
          <meshStandardMaterial color="#e6cb93" emissive="#b8924c" emissiveIntensity={0.2} metalness={0.3} roughness={0.32} />
        </mesh>
        <mesh position={[0, 4.22, 0.31]}>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial color="#ead8b1" emissive="#ba9552" emissiveIntensity={0.32} metalness={0.08} roughness={0.26} />
        </mesh>
        <mesh position={[0, 4.22, 0.31]}>
          <sphereGeometry args={[0.34, 24, 24]} />
          <meshBasicMaterial color="#d9b873" transparent opacity={0.05} />
        </mesh>
        <mesh position={[0, 4.5, 0.3]}>
          <torusGeometry args={[0.52, 0.026, 16, 54]} />
          <meshStandardMaterial color="#c5a462" emissive="#967436" emissiveIntensity={0.18} metalness={0.88} roughness={0.24} />
        </mesh>
        <group ref={leftDoorRef} position={[-1.34, 0, 0]}>
          <DoorCrescent side="left" />
        </group>
        <group ref={rightDoorRef} position={[1.34, 0, 0]}>
          <DoorCrescent side="right" />
        </group>
      </group>

      <mesh ref={doorGlowRef} position={[0, 0, 0.15]}>
        <boxGeometry args={[3.02, 6.5, 0.04]} />
        <meshBasicMaterial color="#e6c17a" transparent opacity={0.08} />
      </mesh>

      <Html center position={[0, -0.18, 0.27]} transform occlude>
        <motion.button
          type="button"
          onClick={onDoorOpen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isDoorOpen ? 0 : 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="border border-[#c7a668]/75 bg-black/12 px-4 py-1.5 text-[9px] font-medium uppercase tracking-[0.28em] text-[#ddc08a] backdrop-blur-[1.5px] transition hover:bg-black/22"
        >
          Enter The Vault
        </motion.button>
      </Html>

      {sectionBurst}

      <mesh position={[0, 0, -5.35]}>
        <boxGeometry args={[10.4, 8.4, 0.06]} />
        <meshStandardMaterial color="#0d0c0b" roughness={0.94} metalness={0.04} transparent opacity={0.22} />
      </mesh>

      <mesh position={[0, 0, -5.28]}>
        <boxGeometry args={[10.1, 8.1, 0.05]} />
        <meshStandardMaterial color="#151210" roughness={0.85} metalness={0.08} transparent opacity={0.84} />
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
        <Sparkles count={120} scale={[16, 9, 9]} size={1.1} speed={0.16} color="#ccae71" />
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
        return next.slice(-14);
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
    <div className="relative h-screen w-full overflow-hidden bg-[#070605] text-white">
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
            className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-8 text-center"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.42em] text-[#cfb176]">Your story begins here...</p>
              <p className="mt-3 max-w-xl text-[13px] leading-7 text-[#f3e6ce]/58">A quiet world of couture silhouettes, polished brass, and soft light awaits behind the doors.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-6 z-30 border border-white/12 bg-black/18 px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-white/58 backdrop-blur-md">
        Noir lacquer · Brushed brass · Quiet light
      </div>

      <Link
        href="/find-my-dress"
        className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 border border-[#b99858]/60 bg-black/16 px-4 py-1 text-[9px] uppercase tracking-[0.28em] text-[#e2c891] backdrop-blur-md"
      >
        Find My Dress AI
      </Link>

      <button
        type="button"
        onClick={() => setSoundEnabled((value) => !value)}
        className={`absolute bottom-6 right-6 z-30 border px-3 py-1 text-[9px] uppercase tracking-[0.28em] backdrop-blur-md transition ${soundEnabled ? "border-[#c6a45f] bg-[#9e7d3a]/12 text-[#ecd5a4]" : "border-white/12 bg-black/18 text-white/58"}`}
      >
        Magical music {soundEnabled ? "On" : "Off"}
      </button>
    </div>
  );
}
