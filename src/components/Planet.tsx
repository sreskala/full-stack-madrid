import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, BackSide, Color, MeshPhysicalMaterial, MeshStandardMaterial, MeshPhongMaterial } from 'three'
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
  lowQuality?: boolean // New prop to control level of detail
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
  overrideLinkEmail = false,
  lowQuality = false
}: PlanetProps): JSX.Element => {
  const planetRef = useRef<Mesh>(null!)
  const atmosphereRef = useRef<Mesh>(null!)
  const cloudsRef = useRef<Mesh>(null!)
  const ringsRef = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  
  // For texture memory management
  const [hasInteracted, setHasInteracted] = useState(false)

  // Determine segment count based on quality setting
  const segments = useMemo(() => lowQuality ? 16 : 64, [lowQuality])

  const sendEmail = () => {
    window.open("mailto:sam.reskala@fullstackmadrid.com")
  }

  // Use a memo to avoid recreating texture options on every render
  const textureOptions = useMemo(() => ({
    anisotropy: lowQuality ? 1 : 4,
    encoding: 3001, // sRGB encoding
  }), [lowQuality])

  // Correctly handle texture loading in different quality modes
  const textureUrls = useMemo(() => {
    // Always include the main texture map
    const urls: Record<string, string> = {
      map: textureMap
    }
    
    // Only add detail textures if not in low quality mode
    if (!lowQuality) {
      if (normalMap) urls.normalMap = normalMap
      if (roughnessMap) urls.roughnessMap = roughnessMap
    }
    
    return urls
  }, [textureMap, normalMap, roughnessMap, lowQuality])
  
  // Load textures with optimized settings
  const textures = useTexture(textureUrls)
  
  // Apply texture optimizations
  useEffect(() => {
    if (textures.map) {
      textures.map.anisotropy = textureOptions.anisotropy
      textures.map.needsUpdate = true
    }
    
    // Only process these in high quality mode if they exist
    if (!lowQuality) {
      if (textures.normalMap) {
        textures.normalMap.anisotropy = textureOptions.anisotropy
        textures.normalMap.needsUpdate = true
      }
      if (textures.roughnessMap) {
        textures.roughnessMap.anisotropy = textureOptions.anisotropy
        textures.roughnessMap.needsUpdate = true
      }
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      // No need to dispose textures - drei's useTexture handles this
    }
  }, [textures, textureOptions, lowQuality])

  // Load cloud map separately with optimized settings - only if needed
  const cloudTextureUrl = useMemo(() => 
    !lowQuality && cloudMap ? { cloudMap } : null
  , [cloudMap, lowQuality])
  
  // Only load cloud texture if URL is provided and not in low quality mode
  const cloudTexture = cloudTextureUrl ? useTexture(cloudTextureUrl).cloudMap : null

  // Apply cloud texture optimizations
  useEffect(() => {
    if (cloudTexture) {
      cloudTexture.anisotropy = textureOptions.anisotropy
      cloudTexture.needsUpdate = true
    }
  }, [cloudTexture, textureOptions])

  // Handle interaction state
  useEffect(() => {
    if (hovered && !hasInteracted) {
      setHasInteracted(true)
    }
  }, [hovered, hasInteracted])

  useFrame((state, delta) => {
    // Optimize animations with delta time for consistent speed
    const deltaMultiplier = delta * 60 // Normalize for 60fps
    
    // Only rotate if ref exists
    if (planetRef.current) {
      planetRef.current.rotation.y += deltaMultiplier * 0.01 * (hovered ? rotationSpeed * 2 : rotationSpeed)
    }
    
    // Only process clouds if the ref and texture exist
    if (cloudsRef.current && cloudTexture) {
      cloudsRef.current.rotation.y += deltaMultiplier * 0.01 * rotationSpeed * 1.5
    }
    
    // Only process rings if the ref exists and rings are enabled
    if (ringsRef.current && hasRings) {
      ringsRef.current.rotation.x = -0.5
      ringsRef.current.rotation.y += deltaMultiplier * 0.01 * rotationSpeed * 0.5
    }
    
    // Process atmosphere if ref exists
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += deltaMultiplier * 0.01 * rotationSpeed * 0.5

      // Pulsing atmosphere effect on hover - simplified when in low quality mode
      if (hovered && !lowQuality) {
        const scale = 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.05
        atmosphereRef.current.scale.set(scale, scale, scale)
      } else {
        atmosphereRef.current.scale.set(1.2, 1.2, 1.2)
      }
    }
  })

  // Memoize the click handler
  const handleClick = useMemo(() => () => {
    if (overrideLinkEmail) {
      sendEmail()
    } else {
      navigate(link)
    }
  }, [overrideLinkEmail, link, navigate])

  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Planet core with adaptive detail */}
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
      
      {/* Cloud layer - only render if texture exists and not in low quality mode */}
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

      {/* Rings - only render if explicitly enabled and not in low quality mode */}
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
      
      {/* Atmosphere - simplified in low quality mode */}
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

      {/* Tooltip - only show when hovered */}
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
