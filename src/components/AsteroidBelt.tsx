import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Matrix4, Object3D, BufferGeometry, Float32BufferAttribute } from 'three'
import * as THREE from 'three'

interface AsteroidBeltProps {
  radius: number
  count: number
  width: number
  height: number
}

const AsteroidBelt = ({ radius, count, width, height }: AsteroidBeltProps): JSX.Element => {
  // Use instanced mesh for better performance
  const instancedMeshRef = useRef<InstancedMesh>(null!)
  const pointsRef = useRef<THREE.Points>(null!)
  
  // Create a single temporary object3D for matrix calculations
  const tempObject = useMemo(() => new Object3D(), [])
  
  // Create asteroid positions and transformation matrices
  const { matrices, particlePositions } = useMemo(() => {
    const positions: number[] = []
    const matricesArray: Matrix4[] = []
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const variance = (Math.random() - 0.5) * width
      const heightVariance = (Math.random() - 0.5) * height
      
      // Calculate position
      const x = Math.cos(angle) * (radius + variance)
      const y = heightVariance
      const z = Math.sin(angle) * (radius + variance)
      
      // Add position for particles
      positions.push(x, y, z)
      
      // Calculate matrix for instanced mesh
      tempObject.position.set(x, y, z)
      
      // Random size and rotation
      const scale = Math.random() * 0.08 + 0.02
      tempObject.scale.set(scale, scale, scale)
      tempObject.rotation.set(
        Math.random() * Math.PI, 
        Math.random() * Math.PI, 
        Math.random() * Math.PI
      )
      
      tempObject.updateMatrix()
      matricesArray.push(tempObject.matrix.clone())
    }
    
    return { 
      matrices: matricesArray,
      particlePositions: new Float32BufferAttribute(positions, 3)
    }
  }, [count, radius, width, height, tempObject])

  // Update the rotation of the entire belt on each frame
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05
    }
    
    if (instancedMeshRef.current) {
      instancedMeshRef.current.rotation.y += delta * 0.05
    }
  })

  // For small screens or low-performance devices, use a simpler representation
  const isLowPerformance = useMemo(() => {
    return window.innerWidth < 768 || window.innerHeight < 768 || count <= 100
  }, [count])

  return isLowPerformance ? (
    // Simple points representation for low-performance scenarios
    <points ref={pointsRef}>
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
  ) : (
    // Use instanced mesh for higher-performance scenarios
    <instancedMesh 
      ref={instancedMeshRef}
      args={[undefined, undefined, count]}
      frustumCulled={true}
    >
      <dodecahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial 
        color="#888888" 
        roughness={0.7}
        metalness={0.3}
      />
      {/* Apply pre-calculated matrices */}
      {matrices.map((matrix, i) => {
        if (instancedMeshRef.current) {
          instancedMeshRef.current.setMatrixAt(i, matrix)
        }
        return null
      })}
    </instancedMesh>
  )
}

export default AsteroidBelt
