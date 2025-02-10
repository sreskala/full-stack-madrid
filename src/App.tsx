import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Scene from './components/Scene'
import SpaceScene from './components/SpaceScene'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
    <SpaceScene />
  </div>
  )
}

export default App
