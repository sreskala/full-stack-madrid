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
  onError?: (error: any) => void // Add error callback
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
  lowQuality = false,
  onError // Error callback
}: PlanetProps): JSX.Element => {
  const planetRef = useRef<Mesh>(null!)
  const atmosphereRef = useRef<Mesh>(null!)
  const cloudsRef = useRef<Mesh>(null!)
  const ringsRef = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  
  // Track loading and error states
  const [hasInteracted, setHasInteracted] = useState(false)
  const [textureLoadFailed, setTextureLoadFailed] = useState(false)
  // Track loaded textures with state to avoid undefined issues
  const [loadedTextures, setLoadedTextures] = useState<any>({})
  const [loadedCloudTexture, setLoadedCloudTexture] = useState<any>(null)

  // Determine segment count based on quality setting
  const segments = useMemo(() => lowQuality ? 16 : 64, [lowQuality])
  
  // Memoize the sendEmail function to prevent recreating it on each render
  const sendEmail = useMemo(() => () => {
    window.open("mailto:sam.reskala@fullstackmadrid.com")
  }, [])

  // Memoize texture URLs to prevent unnecessary re-loading
  const textureUrls = useMemo(() => {
    // Don't try to load textures if previous attempts failed
    if (textureLoadFailed) {
      return {}
    }
    
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
  }, [textureMap, normalMap, roughnessMap, lowQuality, textureLoadFailed])
  
  // Memoize cloud texture URL to prevent unnecessary re-loading
  const cloudTextureUrl = useMemo(() => {
    if (textureLoadFailed || lowQuality || !cloudMap) {
      return null
    }
    return { cloudMap }
  }, [cloudMap, lowQuality, textureLoadFailed])

  // Load textures in an effect to avoid render-time issues
  useEffect(() => {
    let isMounted = true;
    
    const loadTextures = async () => {
      // Skip if we've already marked as failed or have no URLs
      if (textureLoadFailed || Object.keys(textureUrls).length === 0) {
        return;
      }
      
      try {
        // Only try to load textures if we have URLs
        const result = await useTexture(textureUrls);
        if (isMounted) {
          setLoadedTextures(result);
        }
      } catch (err) {
        console.error('Failed to load planet textures:', err);
        if (isMounted) {
          setTextureLoadFailed(true);
          if (onError) onError(err);
        }
      }
    };
    
    loadTextures();
    
    return () => {
      isMounted = false;
    };
  }, [textureUrls, textureLoadFailed, onError]);
  
  // Load cloud texture in a separate effect
  useEffect(() => {
    let isMounted = true;
    
    const loadCloudTexture = async () => {
      if (!cloudTextureUrl) return;
      
      try {
        const result = await useTexture(cloudTextureUrl);
        if (isMounted) {
          setLoadedCloudTexture(result.cloudMap);
        }
      } catch (err) {
        // Cloud textures are optional, so just log the error
        console.warn('Failed to load cloud texture:', err);
      }
    };
    
    loadCloudTexture();
    
    return () => {
      isMounted = false;
    };
  }, [cloudTextureUrl]);
  
  // Apply texture optimizations if textures loaded successfully
  useEffect(() => {
    try {
      // Verify we have loaded textures and they're not empty
      if (!textureLoadFailed && loadedTextures && loadedTextures.map) {
        loadedTextures.map.anisotropy = lowQuality ? 1 : 4;
        loadedTextures.map.needsUpdate = true;
        
        if (!lowQuality) {
          if (loadedTextures.normalMap) {
            loadedTextures.normalMap.anisotropy = lowQuality ? 1 : 4;
            loadedTextures.normalMap.needsUpdate = true;
          }
          if (loadedTextures.roughnessMap) {
            loadedTextures.roughnessMap.anisotropy = lowQuality ? 1 : 4;
            loadedTextures.roughnessMap.needsUpdate = true;
          }
        }
      }
      
      if (loadedCloudTexture) {
        loadedCloudTexture.anisotropy = lowQuality ? 1 : 4;
        loadedCloudTexture.needsUpdate = true;
      }
    } catch (err) {
      console.error("Error optimizing textures:", err);
      // Notify parent but don't fail - we can still render
      if (onError) {
        onError(err);
      }
    }
  }, [loadedTextures, loadedCloudTexture, lowQuality, textureLoadFailed, onError]);

  // Handle interaction state
  useEffect(() => {
    if (hovered && !hasInteracted) {
      setHasInteracted(true);
    }
  }, [hovered, hasInteracted]);

  useFrame((state, delta) => {
    try {
      // Optimize animations with delta time for consistent speed
      const deltaMultiplier = delta * 60; // Normalize for 60fps
      
      // Only rotate if ref exists
      if (planetRef.current) {
        planetRef.current.rotation.y += deltaMultiplier * 0.01 * (hovered ? rotationSpeed * 2 : rotationSpeed);
      }
      
      // Only process clouds if the ref and texture exist
      if (cloudsRef.current && loadedCloudTexture) {
        cloudsRef.current.rotation.y += deltaMultiplier * 0.01 * rotationSpeed * 1.5;
      }
      
      // Only process rings if the ref exists and rings are enabled
      if (ringsRef.current && hasRings) {
        ringsRef.current.rotation.x = -0.5;
        ringsRef.current.rotation.y += deltaMultiplier * 0.01 * rotationSpeed * 0.5;
      }
      
      // Process atmosphere if ref exists
      if (atmosphereRef.current) {
        atmosphereRef.current.rotation.y += deltaMultiplier * 0.01 * rotationSpeed * 0.5;

        // Pulsing atmosphere effect on hover - simplified when in low quality mode
        if (hovered && !lowQuality) {
          const scale = 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
          atmosphereRef.current.scale.set(scale, scale, scale);
        } else {
          atmosphereRef.current.scale.set(1.2, 1.2, 1.2);
        }
      }
    } catch (err) {
      console.error("Error in animation frame:", err);
      // Don't propagate error as it would crash the scene
    }
  });

  // Memoize the click handler to prevent recreating it on each render
  const handleClick = useMemo(() => () => {
    if (overrideLinkEmail) {
      sendEmail();
    } else {
      navigate(link);
    }
  }, [overrideLinkEmail, link, navigate, sendEmail]);

  // If texture loading failed or we're in fallback mode, render a simple colored sphere
  if (textureLoadFailed || !loadedTextures.map) {
    return (
      <group 
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <mesh ref={planetRef}>
          <sphereGeometry args={[radius, segments / 2, segments / 2]} />
          <meshStandardMaterial 
            color={color}
            roughness={0.7}
            metalness={0.2} 
          />
        </mesh>
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[radius * 1.2, segments / 2, segments / 2]} />
          <meshPhongMaterial 
            color={atmosphereColor}
            transparent={true}
            opacity={0.3}
            side={BackSide}
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
    );
  }

  // Main render when textures are available
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
          map={loadedTextures.map}
          normalMap={loadedTextures.normalMap}
          roughnessMap={loadedTextures.roughnessMap}
          roughness={0.8}
          metalness={0.2}
          emissive={new Color(color)}
          emissiveIntensity={hovered ? 0.2 : 0}
          envMapIntensity={lowQuality ? 0.5 : 1.5}
        />
      </mesh>
      
      {/* Cloud layer - only render if texture exists and not in low quality mode */}
      {loadedCloudTexture && !lowQuality && (
        <mesh ref={cloudsRef} scale={1.02}>
          <sphereGeometry args={[radius, segments, segments]} />
          <meshStandardMaterial 
            map={loadedCloudTexture}
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
  );
};

export default Planet;
