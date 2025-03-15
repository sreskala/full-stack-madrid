import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Preload, AdaptiveDpr, Html } from '@react-three/drei'
import { Suspense, lazy, useState, useEffect, useCallback, useRef, memo } from 'react'
import MainText from './MainText'
import { QualityLevel } from './PerformanceManager'
import { isLowPerformanceDevice } from '../utils/textureUtils'
import { preloadService } from '../utils/preloadService'

// Lazy load heavy components with error boundaries
const Planet = lazy(() => import('./Planet'))
const AsteroidBelt = lazy(() => import('./AsteroidBelt'))

// Loading component - memoized to prevent unnecessary re-renders
const Loader = memo(() => (
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
))

// Error boundary fallback for Three.js components
const ErrorFallback = memo(({ name = "component" }: { name?: string }) => (
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
      <div>Failed to render {name}</div>
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        Try refreshing the page
      </div>
    </div>
  </Html>
))

// Memoized planet to prevent unnecessary re-renders
const MemoizedPlanet = memo(Planet)

// Component to safely render Planet with error handling
const SafePlanet = memo(({ name, ...props }) => {
  const [hasError, setHasError] = useState(false)
  
  // Reset error state if props change significantly
  useEffect(() => {
    setHasError(false)
  }, [props.position, props.textureMap])
  
  if (hasError) {
    return <ErrorFallback name={name} />
  }
  
  return (
    <Suspense fallback={<Loader />}>
      <MemoizedPlanet 
        {...props} 
        onError={() => setHasError(true)}
      />
    </Suspense>
  )
})

// Memoized asteroid belt to prevent unnecessary re-renders
const MemoizedAsteroidBelt = memo(AsteroidBelt)

// Component to safely render AsteroidBelt with error handling
const SafeAsteroidBelt = memo((props) => {
  const [hasError, setHasError] = useState(false)
  
  if (hasError) {
    return <ErrorFallback name="asteroid belt" />
  }
  
  return (
    <Suspense fallback={null}>
      <MemoizedAsteroidBelt 
        {...props} 
        onError={() => setHasError(true)}
      />
    </Suspense>
  )
})

const SpaceScene = (): JSX.Element => {
  // Add state for reduced quality during interactions
  const [interacting, setInteracting] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>(
    isLowPerformanceDevice() ? QualityLevel.LOW : QualityLevel.HIGH
  )
  const interactionTimeoutRef = useRef<number | null>(null)

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
  
  // Handle pointer events with debounce to prevent rapid state changes
  const handlePointerDown = useCallback(() => {
    setInteracting(true)
    
    // Clear any existing timeout
    if (interactionTimeoutRef.current !== null) {
      window.clearTimeout(interactionTimeoutRef.current)
    }
  }, [])
  
  const handlePointerUp = useCallback(() => {
    // Set a timeout to delay switching back to high quality
    if (interactionTimeoutRef.current !== null) {
      window.clearTimeout(interactionTimeoutRef.current)
    }
    
    interactionTimeoutRef.current = window.setTimeout(() => {
      setInteracting(false)
      interactionTimeoutRef.current = null
    }, 500) // Wait 500ms after interaction stops before improving quality
  }, [])
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current !== null) {
        window.clearTimeout(interactionTimeoutRef.current)
      }
    }
  }, [])

  // Use memoized props for planets to prevent unnecessary re-renders
  const planet1Props = useMemo(() => ({
    position: [-8, 0, -5] as [number, number, number],
    radius: 2,
    color: "#ff4455",
    atmosphereColor: "#ff66776",
    rotationSpeed: 0.5,
    name: "About Us",
    description: "Click to learn more about our expertise",
    link: "/about",
    textureMap: "/textures/planets/Mars_Map.webp",
    normalMap: "/textures/planets/mars_1k_normal.jpg",
    roughnessMap: "/textures/planets/marsbump1k.jpg",
    lowQuality: getLowQualityMode()
  }), [getLowQualityMode])
  
  const planet2Props = useMemo(() => ({
    position: [8, 2, -3] as [number, number, number],
    radius: 1.5,
    color: "#44aaff",
    atmosphereColor: "#66ccff6",
    rotationSpeed: 0.3,
    name: "Courses",
    description: "Explore our learning paths",
    link: "/courses",
    textureMap: "/textures/planets/8081_earthmap4k.jpg",
    normalMap: "/textures/planets/earth_normalmap.jpg",
    roughnessMap: "/textures/planets/8081_earthbump4k.jpg",
    cloudMap: "/textures/planets/earthcloudmap.jpg",
    lowQuality: getLowQualityMode()
  }), [getLowQualityMode])
  
  const planet3Props = useMemo(() => ({
    position: [0, -6, -2] as [number, number, number],
    radius: 1,
    color: "#ffaa44",
    atmosphereColor: "#ffcc666",
    rotationSpeed: 0.7,
    name: "Contact",
    description: "Send us an email!",
    link: "/",
    textureMap: "/textures/planets/plutomap2k.jpg",
    normalMap: "/textures/planets/mars_1k_normal.jpg",
    roughnessMap: "/textures/planets/plutobump2k.jpg",
    overrideLinkEmail: true,
    lowQuality: getLowQualityMode()
  }), [getLowQualityMode])
  
  const asteroidBeltProps = useMemo(() => ({
    radius: 12,
    count: getLowQualityMode() ? 50 : 200,
    width: 2,
    height: 0.2
  }), [getLowQualityMode])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <Canvas 
        dpr={pixelRatio}
        camera={{ position: [0, 5, 20], fov: 50 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        performance={{ min: 0.5 }}
        // Log errors instead of crashing
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
        
        {/* Main scene content in suspense boundary */}
        <Suspense fallback={<Loader />}>
          {/* Background stars with reduced count */}
          <Stars radius={100} depth={50} count={getLowQualityMode() ? 1000 : 3000} factor={4} saturation={0} fade speed={1} />
          
          {/* Main text */}
          <MainText />
          
          {/* Interactive Planets with error handling */}
          <SafePlanet 
            name="Mars"
            {...planet1Props}
          />
          <SafePlanet 
            name="Earth"
            {...planet2Props}
          />
          <SafePlanet 
            name="Pluto"
            {...planet3Props}
          />

          {/* Asteroid belt with error handling */}
          <SafeAsteroidBelt {...asteroidBeltProps} />
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
