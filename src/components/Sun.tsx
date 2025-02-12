// src/components/Sun.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, PointLight, Color } from 'three'
import { useTexture } from '@react-three/drei'

interface SunProps {
  position: [number, number, number]
  size: number
}

const Sun = ({ position, size }: SunProps): JSX.Element => {
  const sunRef = useRef<Mesh>(null!)
  const lightRef = useRef<PointLight>(null!)
  
  // Load sun texture
  const sunTexture = useTexture('/textures/sun/8k_sun.jpg')
  
  useFrame((state, delta) => {
    // Rotate the sun
    sunRef.current.rotation.y += delta * 0.1
    
    // Create pulsing light effect
    const intensity = 1.5 + Math.sin(state.clock.elapsedTime) * 0.2
    lightRef.current.intensity = intensity
  })

  return (
    <group position={position}>
      {/* Sun mesh */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial 
          map={sunTexture}
          emissive={new Color('#FDB813')}
          emissiveIntensity={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Main sun light */}
      <pointLight 
        ref={lightRef}
        distance={100}
        intensity={1.5}
        color="#FFF5E6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Corona glow effect */}
      <mesh>
        <sphereGeometry args={[size * 1.2, 32, 32]} />
        <meshBasicMaterial
          color={new Color('#FDB813')}
          transparent
          opacity={0.1}
        />
      </mesh>
      
      {/* Additional ambient flare */}
      <pointLight
        color="#FF7F50"
        intensity={0.5}
        distance={50}
      />
    </group>
  )
}

export default Sun