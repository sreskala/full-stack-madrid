import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Preload, AdaptiveDpr, Html } from '@react-three/drei'
import { Suspense, lazy, useState, useEffect, useCallback } from 'react'
import MainText from './MainText'
import { QualityLevel } from './PerformanceManager'
import { isLowPerformanceDevice } from '../utils/textureUtils'
import { preloadService } from '../utils/preloadService'

// Lazy load heavy components
const Planet = lazy(() => import('./Planet'))
const AsteroidBelt = lazy(() => import('./AsteroidBelt'))

// Loading component
const Loader = () => (
  <Html center>
    <div style={{ 
      color: 'white', 
      background: 'rgba(0, 0, 0, 0.7)', 
      padding: '20px', 
      borderRadius: '5px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <div>Loading Space Scene...</div>
      <div style={{ marginTop: '10px', fontSize: '12px' }}>Preparing the cosmos for your journey</div>
    </div>
  </Html>
)

// Error boundary fallback for Three.js components
const ErrorFallback = () => (
  <Html center>
    <div style={{ 
      color: 'white', 
      background: 'rgba(255, 0, 0, 0.3)', 
      padding: '20px', 
      borderRadius: '5px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      border: '1px solid rgba(255, 0, 0, 0.5)'
    }}>
      <div>Something went wrong rendering this element</div>
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        Try refreshing the page or using a different browser
      </div>
    </div>
  </Html>
)

// Component to safely render Planet with error handling
const SafePlanet = (props) => {
  // Use error boundary pattern with try/catch
  try {
    return <Planet {...props} />
  } catch (error) {
    console.error("Error rendering Planet:", error)
    return <ErrorFallback />
  }
}

// Component to safely render AsteroidBelt with error handling
const SafeAsteroidBelt = (props) => {
  try {
    return <AsteroidBelt {...props} />
  } catch (error) {
    console.error("Error rendering AsteroidBelt:", error)
    return <ErrorFallback />
  }
}

const SpaceScene = (): JSX.Element => {
  // Add state for reduced quality during interactions
  const [interacting, setInteracting] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>(
    isLowPerformanceDevice() ? QualityLevel.LOW : QualityLevel.HIGH
  )

  // Start preloading textures
  useEffect(() => {
    preloadService.startPreloading()
  }, [])
  
  // Set initial load to false after components are loaded
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Determine pixel ratio based on device and interaction state
  const pixelRatio = interacting ? 1 : window.devicePixelRatio

  // Handle quality change from PerformanceManager
  const handleQualityChange = useCallback((quality: QualityLevel) => {
    setQualityLevel(quality)
  }, [])

  // Get low quality mode based on interaction state and quality level
  const getLowQualityMode = useCallback(() => {
    return interacting || isInitialLoad || qualityLevel === QualityLevel.LOW
  }, [interacting, isInitialLoad, qualityLevel])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <Canvas 
        dpr={pixelRatio}
        camera={{ position: [0, 5, 20], fov: 50 }}
        onPointerDown={() => setInteracting(true)}
        onPointerUp={() => setInteracting(false)}
        performance={{ min: 0.5 }}
        // Use error boundary to catch rendering errors
        onError={(e) => console.error("Canvas error:", e)}
      >
        {/* Performance optimizers */}
        <AdaptiveDpr pixelated />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <hemisphereLight
          color="#fffff"
          groundColor="#000000"
          intensity={0.5}
        />
        
        {/* Suspense for lazy loading */}
        <Suspense fallback={<Loader />}>
          {/* Background stars with reduced count */}
          <Stars radius={100} depth={50} count={getLowQualityMode() ? 1000 : 3000} factor={4} saturation={0} fade speed={1} />
          
          {/* Main text */}
          <MainText />
          
          {/* Interactive Planets with error handling */}
          <SafePlanet 
            position={[-8, 0, -5]} 
            radius={2} 
            color="#ff4455"
            atmosphereColor="#ff66776"
            rotationSpeed={0.5}
            name="About Us"
            description="Click to learn more about our expertise"
            link="/about"
            textureMap="/textures/planets/Mars_Map.webp"
            normalMap="/textures/planets/mars_1k_normal.jpg"
            roughnessMap="/textures/planets/marsbump1k.jpg"
            lowQuality={getLowQualityMode()}
          />
          <SafePlanet 
            position={[8, 2, -3]} 
            radius={1.5} 
            color="#44aaff"
            atmosphereColor="#66ccff6"
            rotationSpeed={0.3}
            name="Courses"
            description="Explore our learning paths"
            link="/courses"
            textureMap="/textures/planets/8081_earthmap4k.jpg"
            normalMap="/textures/planets/earth_normalmap.jpg"
            roughnessMap="/textures/planets/8081_earthbump4k.jpg"
            cloudMap="/textures/planets/earthcloudmap.jpg"
            lowQuality={getLowQualityMode()}
          />
          <SafePlanet 
            position={[0, -6, -2]} 
            radius={1} 
            color="#ffaa44"
            atmosphereColor="#ffcc666"
            rotationSpeed={0.7}
            name="Contact"
            description="Send us an email!"
            link="/"
            textureMap="/textures/planets/plutomap2k.jpg"
            normalMap="/textures/planets/mars_1k_normal.jpg"
            roughnessMap="/textures/planets/plutobump2k.jpg"
            overrideLinkEmail={true}
            lowQuality={getLowQualityMode()}
          />

          {/* Asteroid belts with reduced count during interaction */}
          <SafeAsteroidBelt 
            radius={12} 
            count={getLowQualityMode() ? 50 : 200} 
            width={2}
            height={0.2}
          />
        </Suspense>

        {/* Controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={10}
          maxDistance={30}
          rotateSpeed={0.5}
          // Add dampening for smoother camera movements
          enableDamping={true}
          dampingFactor={0.05}
        />
        
        {/* Preload critical assets */}
        <Preload all />
      </Canvas>
    </div>
  )
}

export default SpaceScene
