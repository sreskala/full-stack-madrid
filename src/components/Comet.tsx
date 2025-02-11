import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Mesh } from 'three'
import { Trail } from '@react-three/drei'

interface CometProps {
  startPosition: [number, number, number]
  endPosition: [number, number, number]
  duration: number
}

const Comet = ({ startPosition, endPosition, duration }: CometProps): JSX.Element => {
  const cometRef = useRef<Mesh>(null!)
  const timeRef = useRef(0)
  const startVec = new Vector3(...startPosition)
  const endVec = new Vector3(...endPosition)

  useFrame((state, delta) => {
    timeRef.current = (timeRef.current + delta / duration) % 1
    startVec.lerp(endVec, timeRef.current)
    cometRef.current.position.copy(startVec)
  })

  return (
    <>
      <mesh ref={cometRef} position={startPosition}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
        <Trail
          width={1}
          length={8}
          color="#ffffff"
          attenuation={(t: number) => t * t}
        />
      </mesh>
    </>
  )
}

export default Comet