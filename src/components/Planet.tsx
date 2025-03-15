import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, BackSide, Color, TextureLoader } from 'three'
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
  lowQuality?: boolean
  onError?: (error: any) => void
}

// Simpler component to avoid issues
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
  overrideLinkEmail = false,
  lowQuality = false,
  onError
}: PlanetProps): JSX.Element => {
  const planetRef = useRef<Mesh>(null!)
  const atmosphereRef = useRef<Mesh>(null!)
  const cloudsRef = useRef<Mesh>(null!)
  const ringsRef = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  
  // State to track errors
  const [renderFallback, setRenderFallback] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  
  // Simplify by loading only what's needed
  const segments = useMemo(() => lowQuality ? 16 : 64, [lowQuality])
  
  // Email function
  const sendEmail = useMemo(() => () => {
    window.open("mailto:sam.reskala@fullstackmadrid.com")
  }, [])
  
  // Create texture URLs based on quality
  const textureProps = useMemo(() => {
    if (lowQuality) {
      return { map: textureMap }
    } else {
      return { 
        map: textureMap,
        normalMap,
        roughnessMap
      }
    }
  }, [textureMap, normalMap, roughnessMap, lowQuality])
  
  // Load textures - guaranteed to be safe
  let textures = {}
  let cloudTexture = null
  
  try {
    // Only load textures if not in fallback mode
    if (!renderFallback) {
      textures = useTexture(textureProps)
      
      // Load cloud texture separately if needed
      if (cloudMap && !lowQuality) {
        const cloudTextures = useTexture({ cloudMap })
        cloudTexture = cloudTextures.cloudMap
      }
    }
  } catch (error) {
    // If loading fails, switch to fallback rendering
    console.error('Error loading textures:', error)
    if (onError) onError(error)
    
    // Instead of updating state directly (which causes re-render issues),
    // we'll check in useEffect if textures.map exists
  }
  
  // Check if textures loaded properly and switch to fallback if needed
  useEffect(() => {
    if (!textures || !textures.map) {
      setRenderFallback(true)
    }
  }, [textures])
  
  // Handle interaction state
  useEffect(() => {
    if (hovered && !hasInteracted) {
      setHasInteracted(true)
    }
  }, [hovered, hasInteracted])
  
  // Handle animations
  useFrame((state, delta) => {
    try {
      const deltaMultiplier = delta * 60 // Normalize for 60fps
      
      if (planetRef.current) {
        planetRef.current.rotation.y += deltaMultiplier * 0.01 * (hovered ? rotationSpeed * 2 : rotationSpeed)
      }
      
      if (cloudsRef.current && cloudTexture) {
        cloudsRef.current.rotation.y += deltaMultiplier * 0.01 * rotationSpeed * 1.5
      }
      
      if (ringsRef.current && hasRings) {
        ringsRef.current.rotation.x = -0.5
        ringsRef.current.rotation.y += deltaMultiplier * 0.01 * rotationSpeed * 0.5
      }
      
      if (atmosphereRef.current) {
        atmosphereRef.current.rotation.y += deltaMultiplier * 0.01 * rotationSpeed * 0.5
        
        if (hovered && !lowQuality) {
          const scale = 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.05
          atmosphereRef.current.scale.set(scale, scale, scale)
        } else {
          atmosphereRef.current.scale.set(1.2, 1.2, 1.2)
        }
      }
    } catch (error) {
      console.error('Animation error:', error)
    }
  })
  
  // Click handler
  const handleClick = useMemo(() => () => {
    if (overrideLinkEmail) {
      sendEmail()
    } else {
      navigate(link)
    }
  }, [overrideLinkEmail, link, navigate, sendEmail])
  
  // Fallback rendering when textures fail to load
  if (renderFallback) {
    return (
      <group 
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <mesh ref={planetRef}>
          <sphereGeometry args={[radius, Math.max(12, segments/2), Math.max(12, segments/2)]} />
          <meshStandardMaterial 
            color={color}
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[radius * 1.2, Math.max(12, segments/2), Math.max(12, segments/2)]} />
          <meshPhongMaterial 
            color={atmosphereColor}
            transparent={true}
            opacity={0.3}
            side={BackSide}
          />
        </mesh>
        
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
  
  // Main render with textures
  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Planet core */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, segments, segments]} />
        <meshPhysicalMaterial 
          map={textures.map}
          normalMap={textures.normalMap}
          roughnessMap={textures.roughnessMap}
          roughness={0.8}
          metalness={0.2}
          emissive={new Color(color)}
          emissiveIntensity={hovered ? 0.2 : 0}
          envMapIntensity={lowQuality ? 0.5 : 1.5}
        />
      </mesh>
      
      {/* Cloud layer */}
      {cloudTexture && !lowQuality && (
        <mesh ref={cloudsRef} scale={1.02}>
          <sphereGeometry args={[radius, segments, segments]} />
          <meshStandardMaterial 
            map={cloudTexture}
            transparent={true}
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Rings */}
      {hasRings && !lowQuality && (
        <mesh ref={ringsRef}>
          <ringGeometry args={[radius * 1.4, radius * 2.2, segments]} />
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
        <sphereGeometry args={[
          radius * 1.2, 
          lowQuality ? Math.max(8, segments / 2) : segments, 
          lowQuality ? Math.max(8, segments / 2) : segments
        ]} />
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
