import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, BackSide } from 'three'
import { Html } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'

interface PlanetProps {
  position: [number, number, number]
  radius: number
  color: string
  atmosphereColor: string
  rotationSpeed: number
  name: string
  description: string
  link: string
}

const Planet = ({ position, radius, color, atmosphereColor, rotationSpeed, name, description, link }: PlanetProps): JSX.Element => {
  const planetRef = useRef<Mesh>(null!)
  const atmosphereRef = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  
  useFrame((state, delta) => {
    planetRef.current.rotation.y += delta * (hovered ? rotationSpeed * 2 : rotationSpeed)
    atmosphereRef.current.rotation.y += delta * rotationSpeed * 0.5

    // Pulsing atmosphere effect on hover
    if (hovered) {
      const scale = 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.05
      atmosphereRef.current.scale.set(scale, scale, scale)
    } else {
      atmosphereRef.current.scale.set(1.2, 1.2, 1.2)
    }
  })

  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => navigate(link)}
    >
      {/* Planet core */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.7}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
      
      {/* Atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[radius * 1.2, 32, 32]} />
        <meshPhongMaterial 
          color={atmosphereColor}
          transparent={true}
          opacity={hovered ? 0.5 : 0.3}
          side={BackSide}
        />
      </mesh>

      {/* Tooltip */}
      {hovered && (
        <Html position={[0, radius * 2, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            backdropFilter: 'blur(4px)',
            transform: 'translateY(-20px)',
          }}>
            <strong>{name}</strong>
            <br />
            {description}
          </div>
        </Html>
      )}
    </group>
  )
}

export default Planet