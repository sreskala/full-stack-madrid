import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import Planet from './Planet'
import AsteroidBelt from './AsteroidBelt'
import MainText from './MainText'

const SpaceScene = (): JSX.Element => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <Canvas camera={{ position: [0, 5, 20], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <hemisphereLight
          color="#fffff"
          groundColor="#000000"
          intensity={0.5}
        />

        {/* <Sun position={[15, 10, -10]} size={5} /> */}
        
        {/* Background stars */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Main text */}
        <MainText />
        
        {/* Interactive Planets */}
        <Planet 
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
        />
        <Planet 
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
        />
        <Planet 
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
          // hasRings={true}
          // ringColor="#C7B29A"
        />

        {/* Asteroid belts */}
        <AsteroidBelt 
          radius={12} 
          count={200} 
          width={2}
          height={0.2}
        />

        
        {/* Controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={10}
          maxDistance={30}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}

export default SpaceScene
