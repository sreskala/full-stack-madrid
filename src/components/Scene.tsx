import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Box from './Box'

const Scene = (): JSX.Element => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box position={[0, 0, 0]} />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default Scene