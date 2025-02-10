import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface PlanetProps {
  position: [number, number, number]
  radius: number
  color: string
  rotationSpeed: number
}

const Planet = ({ position, radius, color, rotationSpeed }: PlanetProps): JSX.Element => {
  const meshRef = useRef<Mesh>(null!)
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * rotationSpeed
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial 
        color={color}
        roughness={0.7}
        metalness={0.3}
      />
    </mesh>
  )
}

export default Planet