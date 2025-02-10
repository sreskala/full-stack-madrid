import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text3D, Stars } from '@react-three/drei'
import Planet from './Planet'
import MainText from './MainText'

const SpaceScene = (): JSX.Element => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Background stars */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Main text */}
        <MainText />
        
        {/* Planets */}
        <Planet 
          position={[-8, 0, -5]} 
          radius={2} 
          color="#ff4455"
          rotationSpeed={0.5}
        />
        <Planet 
          position={[8, 2, -3]} 
          radius={1.5} 
          color="#44aaff"
          rotationSpeed={0.3}
        />
        <Planet 
          position={[0, -6, -2]} 
          radius={1} 
          color="#ffaa44"
          rotationSpeed={0.7}
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