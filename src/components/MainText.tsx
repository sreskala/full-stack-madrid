import { Text } from '@react-three/drei'

const MainText = (): JSX.Element => {
  return (
    <Text
      position={[0, 0, 0]}
      fontSize={2}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      font="/fonts/SpaceCrusaders-x3DP0.ttf"
      //font="/path/to/your/font.ttf" // You'll need to add a font file to your public directory
    >
      Full Stack Madrid
    </Text>
  )
}

export default MainText