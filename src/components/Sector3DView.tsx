import React, { useState, Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, Box } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Box as BoxIcon, Activity, Settings, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

const EQUIPMENT_TYPES = [
  { id: 'cnc', name: 'Centro de Usinagem CNC', color: '#3b82f6', shape: 'cnc', size: [3, 2.5, 2] as [number, number, number] },
  { id: 'saw', name: 'Serra Dupla Cabeça', color: '#f59e0b', shape: 'saw', size: [5, 2, 1.5] as [number, number, number] },
  { id: 'workbench', name: 'Bancada de Trabalho', color: '#64748b', shape: 'bench', size: [2, 1, 1.5] as [number, number, number] },
];

interface Sector3DViewProps {
  id: string;
  title: string;
  onClose: () => void;
}

interface Equipment {
  id: string;
  typeId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  efficiency: number;
}

const CNCGeometry = ({ color, isSelected }: { color: string, isSelected: boolean }) => (
  <group>
    {/* Base */}
    <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
      <boxGeometry args={[3, 1, 2]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.4} emissive={isSelected ? '#ffffff' : '#000000'} emissiveIntensity={isSelected ? 0.2 : 0} />
    </mesh>
    {/* Back Wall / Column */}
    <mesh position={[0, 0.25, -0.75]} castShadow receiveShadow>
      <boxGeometry args={[3, 1.5, 0.5]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.4} emissive={isSelected ? '#ffffff' : '#000000'} emissiveIntensity={isSelected ? 0.2 : 0} />
    </mesh>
    {/* Spindle Arm */}
    <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.8} />
    </mesh>
    {/* Spindle / Tool */}
    <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
      <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
    </mesh>
    {/* Enclosure Window */}
    <mesh position={[0, 0.25, 0.95]} castShadow>
      <boxGeometry args={[2.8, 1, 0.05]} />
      <meshPhysicalMaterial color="#38bdf8" transmission={0.9} opacity={1} transparent roughness={0.1} />
    </mesh>
  </group>
);

const SawGeometry = ({ color, isSelected }: { color: string, isSelected: boolean }) => (
  <group>
    {/* Main Bed */}
    <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[5, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} emissive={isSelected ? '#ffffff' : '#000000'} emissiveIntensity={isSelected ? 0.2 : 0} />
    </mesh>
    {/* Left Head */}
    <group position={[-2, 0.5, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 1, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.5} emissive={isSelected ? '#ffffff' : '#000000'} emissiveIntensity={isSelected ? 0.2 : 0} />
      </mesh>
      {/* Blade enclosure */}
      <mesh position={[0, -0.2, 0.4]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
    {/* Right Head */}
    <group position={[2, 0.5, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 1, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.5} emissive={isSelected ? '#ffffff' : '#000000'} emissiveIntensity={isSelected ? 0.2 : 0} />
      </mesh>
      {/* Blade enclosure */}
      <mesh position={[0, -0.2, 0.4]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
    {/* Rails */}
    <mesh position={[0, 0.1, -0.3]} receiveShadow rotation={[0, 0, Math.PI/2]}>
      <cylinderGeometry args={[0.05, 0.05, 4.8]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
    </mesh>
  </group>
);

const WorkbenchGeometry = ({ color, isSelected }: { color: string, isSelected: boolean }) => (
  <group>
    {/* Table Top */}
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
      <boxGeometry args={[2, 0.1, 1.5]} />
      <meshStandardMaterial color="#f0abfc" roughness={0.8} metalness={0.1} emissive={isSelected ? '#ffffff' : '#000000'} emissiveIntensity={isSelected ? 0.2 : 0} />
    </mesh>
    {/* Legs */}
    {[-0.9, 0.9].map((x) => 
      [-0.65, 0.65].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, -0.15, z]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.4} emissive={isSelected ? '#ffffff' : '#000000'} emissiveIntensity={isSelected ? 0.2 : 0} />
        </mesh>
      ))
    )}
    {/* Shelf */}
    <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.8, 0.05, 1.3]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
    </mesh>
  </group>
);

const Machine = ({ data, isSelected, onClick }: { data: Equipment, isSelected: boolean, onClick: () => void }) => {
  const meshRef = useRef<THREE.Group>(null);
  const type = EQUIPMENT_TYPES.find(t => t.id === data.typeId)!;

  useFrame((state) => {
    // Add some subtle animation based on type to make it feel alive
    if (data.typeId === 'cnc' && meshRef.current && isSelected) {
      // Simulate spindle moving
      const spindle = meshRef.current.children[2]; // Spindle arm
      if (spindle) spindle.position.x = Math.sin(state.clock.elapsedTime * 2) * 0.5;
      const tool = meshRef.current.children[3]; // Tool
      if (tool) {
        tool.position.x = Math.sin(state.clock.elapsedTime * 2) * 0.5;
        tool.rotation.y += 0.5;
      }
    }
  });

  return (
    <group 
      position={data.position} 
      rotation={data.rotation}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      ref={meshRef}
    >
      {type.shape === 'cnc' && <CNCGeometry color={type.color} isSelected={isSelected} />}
      {type.shape === 'saw' && <SawGeometry color={type.color} isSelected={isSelected} />}
      {type.shape === 'bench' && <WorkbenchGeometry color={type.color} isSelected={isSelected} />}
      
      {/* Indicator LED */}
      <mesh position={[0, type.size[1]/2 + 0.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={data.efficiency > 80 ? '#10b981' : data.efficiency > 50 ? '#f59e0b' : '#ef4444'} 
          emissive={data.efficiency > 80 ? '#10b981' : data.efficiency > 50 ? '#f59e0b' : '#ef4444'}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Selection Highlight */}
      {isSelected && (
        <boxHelper args={[new THREE.Mesh(new THREE.BoxGeometry(...type.size)), 0xffffff]} />
      )}
    </group>
  );
};

export function Sector3DView({ id, title, onClose }: Sector3DViewProps) {
  const [equipments, setEquipments] = useState<Equipment[]>([
    { id: '1', typeId: 'cnc', position: [-4, 1.25, -2], rotation: [0, 0, 0], efficiency: 95 },
    { id: '2', typeId: 'saw', position: [2, 1, -2], rotation: [0, 0, 0], efficiency: 62 },
    { id: '3', typeId: 'workbench', position: [-2, 0.5, 3], rotation: [0, 0, 0], efficiency: 88 },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState<string | null>(null);

  const handlePointerDown = (e: any) => {
    if (isPlacing) {
      if (e.object.name === 'ground') {
        const point = e.point;
        // Snap to grid
        const x = Math.round(point.x);
        const z = Math.round(point.z);
        const type = EQUIPMENT_TYPES.find(t => t.id === isPlacing)!;
        
        const newEq: Equipment = {
          id: Math.random().toString(),
          typeId: isPlacing,
          position: [x, type.size[1] / 2, z],
          rotation: [0, 0, 0],
          efficiency: 100,
        };
        setEquipments([...equipments, newEq]);
        setIsPlacing(null);
      }
    } else {
      // Clicked on empty ground
      if (e.object.name === 'ground') {
        setSelectedId(null);
      }
    }
  };

  const selectedEq = equipments.find(e => e.id === selectedId);
  const selectedType = selectedEq ? EQUIPMENT_TYPES.find(t => t.id === selectedEq.typeId) : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f1115]">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md border-b border-white/10 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <BoxIcon size={16} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {EQUIPMENT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setIsPlacing(isPlacing === type.id ? null : type.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border",
                isPlacing === type.id 
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50" 
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
              )}
            >
              <Plus size={14} /> {type.name}
            </button>
          ))}
        </div>
      </header>

      {/* 3D Canvas */}
      <div className="flex-1 relative cursor-crosshair">
        {isPlacing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-purple-500/90 text-white rounded-full text-sm font-bold shadow-lg z-10 animate-pulse pointer-events-none">
            Clique no chão para posicionar
          </div>
        )}

        <Canvas shadows camera={{ position: [10, 10, 10], fov: 35 }}>
          <color attach="background" args={['#0f1115']} />
          
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <directionalLight 
              castShadow 
              position={[10, 20, 10]} 
              intensity={1.5} 
              shadow-mapSize={[1024, 1024]} 
            />
            <Environment preset="city" />

            {/* Grid Ground */}
            <mesh 
              name="ground"
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, 0, 0]} 
              receiveShadow
              onPointerDown={handlePointerDown}
            >
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#1a1c22" />
            </mesh>
            <Grid infiniteGrid fadeDistance={40} sectionColor="#475569" cellColor="#334155" />

            {equipments.map(eq => (
              <Machine 
                key={eq.id} 
                data={eq} 
                isSelected={selectedId === eq.id}
                onClick={() => {
                  if (!isPlacing) setSelectedId(eq.id);
                }} 
              />
            ))}
          </Suspense>

          <OrbitControls 
            makeDefault 
            maxPolarAngle={Math.PI / 2 - 0.05} 
            minDistance={5} 
            maxDistance={50} 
          />
        </Canvas>

        {/* Info Panel Overlay */}
        <AnimatePresence>
          {selectedEq && selectedType && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-6 top-6 w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedType.name}</h3>
                  <p className="text-sm text-slate-400">ID: {selectedEq.id.slice(0, 8)}</p>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  selectedEq.efficiency > 80 ? "bg-emerald-500/20 text-emerald-400" :
                  selectedEq.efficiency > 50 ? "bg-amber-500/20 text-amber-400" :
                  "bg-red-500/20 text-red-400"
                )}>
                  <Activity size={20} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Eficiência OEE</span>
                    <span className="font-bold text-white">{selectedEq.efficiency}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedEq.efficiency}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        selectedEq.efficiency > 80 ? "bg-emerald-500" :
                        selectedEq.efficiency > 50 ? "bg-amber-500" :
                        "bg-red-500"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                      <Zap size={12} /> Energia
                    </div>
                    <div className="text-white font-semibold">12.4 kW</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                      <Settings size={12} /> Status
                    </div>
                    <div className="text-white font-semibold flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        selectedEq.efficiency > 80 ? "bg-emerald-500" : "bg-amber-500"
                      )} />
                      Ativo
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
