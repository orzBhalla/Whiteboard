import Canvas from "./Components/Canvas"
import TextInput from "./Components/TextInput"
import Toolbar from "./Components/Toolbar"
import PropertiesPanel from "./Components/PropertiesPanel"

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <Toolbar />
      <Canvas />
      <TextInput />
      <PropertiesPanel />
    </div>
  )
}

export default App