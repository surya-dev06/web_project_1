import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'
function Orb() {
  const mesh = useRef<Mesh>(null)
  useFrame((state, delta) => { if (mesh.current) { mesh.current.rotation.y += delta * .14; mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * .25) * .16 } })
  return <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.65}>
    <mesh ref={mesh} scale={1.55}><icosahedronGeometry args={[1, 5]} /><meshPhysicalMaterial color="#a7b89b" roughness={0.22} metalness={0.38} clearcoat={0.9} wireframe={false} /></mesh>
    <mesh scale={1.72}><icosahedronGeometry args={[1, 2]} /><meshBasicMaterial color="#d5e6c5" wireframe transparent opacity={0.12} /></mesh>
  </Float>
}
export default function Scene3D() {
  return <div className="scene3d" aria-label="Abstract 3D animated sculpture" role="img">
    <Canvas camera={{ position: [0, 0, 5], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={1.6} /><directionalLight position={[3, 4, 5]} intensity={3} /><pointLight position={[-3, -2, 2]} intensity={2} color="#b2c99e" />
      <Orb /><Environment preset="city" />
    </Canvas>
  </div>
}