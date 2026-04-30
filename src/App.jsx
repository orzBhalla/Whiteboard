import Canvas from "./Components/Canvas"
import Toolbar from "./Components/Toolbar"

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <Toolbar />
      <Canvas />
    </div>
  )
}

export default App