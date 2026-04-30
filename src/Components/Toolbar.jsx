import { Pencil, Square, Circle, Minus, Eraser } from 'lucide-react'
import useWhiteboardStore from '../store/useWhiteboardStore'

const tools = [
    { id: 'pen', icon: Pencil },
    { id: 'rect', icon: Square },
    { id: 'circle', icon: Circle },
    { id: 'line', icon: Minus },
    { id: 'eraser', icon: Eraser },
]

export default function Toolbar() {
    const { tool, setTool } = useWhiteboardStore()

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10
                    flex items-center gap-1 px-3 py-2
                    bg-white rounded-xl shadow-lg border border-gray-200">
            {tools.map(({ id, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => setTool(id)}
                    title={id}
                    className={`p-2 rounded-lg transition-colors
            ${tool === id
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Icon size={18} />
                </button>
            ))}
        </div>
    )
}