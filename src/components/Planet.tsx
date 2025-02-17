import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, BackSide, Color } from 'three'
import { Html, useTexture } from '@react-three/drei'
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
  textureMap?: string
  normalMap?: string
  roughnessMap?: string
  cloudMap?: string
  hasRings?: boolean
  ringColor?: string
  overrideLinkEmail?: boolean
}

const Planet = ({ 
  position, 
  radius, 
  color, 
  atmosphereColor, 
  rotationSpeed, 
  name, 
  description, 
  link,
  textureMap = '/textures/planets/default_planet.jpg',
  normalMap = '/textures/planets/default_normal.jpg',
  roughnessMap = '/textures/planets/default_roughness.jpg',
  cloudMap,
  hasRings,
  ringColor = '#A7A7A7',
  overrideLinkEmail = false
}: PlanetProps): JSX.Element => {
  const planetRef = useRef<Mesh>(null!)
  const atmosphereRef = useRef<Mesh>(null!)
  const cloudsRef = useRef<Mesh>(null!)
  const ringsRef = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()

  const sendEmail = () => {
    window.open("mailto:sam.reskala@fullstackmadrid.com")
  }

  // Load textures
  const textures = useTexture({
    map: textureMap,
    normalMap: normalMap,
    roughnessMap: roughnessMap,
    // cloudMap: cloudMap
  })

  // const cloudTexture = useTexture(cloudMap ?? "")
  let cloudTexture;
  if (cloudMap) {
    cloudTexture = useTexture(cloudMap)
  }

  useFrame((state, delta) => {
    planetRef.current.rotation.y += delta * (hovered ? rotationSpeed * 2 : rotationSpeed)
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * rotationSpeed * 1.5
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.x = -0.5
      ringsRef.current.rotation.y += delta * rotationSpeed * 0.5
    }
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
      onClick={() => {
        if (overrideLinkEmail) {
          sendEmail();
        } else {
          navigate(link) 
        }
      }}
    >
      {/* Planet core */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhysicalMaterial 
          map={textures.map}
          normalMap={textures.normalMap}
          roughnessMap={textures.roughnessMap}
          roughness={0.8}
          metalness={0.2}
          emissive={new Color(color)}
          emissiveIntensity={hovered ? 0.2 : 0}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Cloud layer */}
      {cloudMap && cloudTexture &&(
        <mesh ref={cloudsRef} scale={1.02}>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial 
            map={cloudTexture}
            transparent={true}
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Rings (if enabled) */}
      {hasRings && (
        <mesh ref={ringsRef}>
          <ringGeometry args={[radius * 1.4, radius * 2.2, 64]} />
          <meshStandardMaterial 
            color={ringColor}
            transparent={true}
            opacity={0.6}
            side={BackSide}
          />
        </mesh>
      )}
      
      {/* Atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[radius * 1.2, 64, 64]} />
        <meshPhongMaterial 
          color={atmosphereColor}
          transparent={true}
          opacity={hovered ? 0.5 : 0.3}
          side={BackSide}
          depthWrite={false}
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
