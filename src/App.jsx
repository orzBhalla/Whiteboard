import Canvas from "./Components/Canvas"
import TextInput from "./Components/TextInput"
import Toolbar from "./Components/Toolbar"
import PropertiesPanel from "./Components/PropertiesPanel"
import useWhiteboardStore from "./store/useWhiteboardStore"
import { useEffect } from "react"

function App() {
  const { undo, redo, resetView } = useWhiteboardStore()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo() }
      if (e.ctrlKey && e.key === '0') { e.preventDefault(); resetView() }  // ← add this
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, resetView])

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