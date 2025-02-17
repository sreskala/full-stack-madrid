import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float32BufferAttribute } from 'three'
import * as THREE from 'three'

interface AsteroidBeltProps {
  radius: number
  count: number
  width: number
  height: number
}

const AsteroidBelt = ({ radius, count, width, height }: AsteroidBeltProps): JSX.Element => {
  const points = useRef<THREE.Points>(null!)
  
  const particlePositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const variance = (Math.random() - 0.5) * width
      const heightVariance = (Math.random() - 0.5) * height
      
      positions.push(
        Math.cos(angle) * (radius + variance),
        heightVariance,
        Math.sin(angle) * (radius + variance)
      )
    }
    return new Float32BufferAttribute(positions, 3)
  }, [count, radius, width, height])

  useFrame((_, delta) => {
    points.current.rotation.y += delta * 0.05
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" {...particlePositions} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#888888"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

export default AsteroidBelt