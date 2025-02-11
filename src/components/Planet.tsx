import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, BackSide } from 'three'

interface PlanetProps {
  position: [number, number, number]
  radius: number
  color: string
  atmosphereColor: string
  rotationSpeed: number
}

const Planet = ({ position, radius, color, atmosphereColor, rotationSpeed }: PlanetProps): JSX.Element => {
  const planetRef = useRef<Mesh>(null!)
  const atmosphereRef = useRef<Mesh>(null!)
  
  useFrame((state, delta) => {
    planetRef.current.rotation.y += delta * rotationSpeed
    atmosphereRef.current.rotation.y += delta * rotationSpeed * 0.5
  })

  return (
    <group position={position}>
      {/* Planet core */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[radius * 1.2, 32, 32]} />
        <meshPhongMaterial 
          color={atmosphereColor}
          transparent={true}
          opacity={0.3}
          side={BackSide}
        />
      </mesh>
    </group>
  )
}

export default Planet