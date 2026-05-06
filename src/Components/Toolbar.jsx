import { Pencil, Square, Circle, Minus, Eraser, Type, MoveUpRight, Undo2, Redo2 } from 'lucide-react'
import useWhiteboardStore from '../store/useWhiteboardStore'

const tools = [
    { id: 'pen', icon: Pencil },
    { id: 'rect', icon: Square },
    { id: 'circle', icon: Circle },
    { id: 'line', icon: Minus },
    { id: 'arrow', icon: MoveUpRight },
    { id: 'eraser', icon: Eraser },
    { id: 'text', icon: Type },
]

export default function Toolbar() {
    const { tool, setTool, undo, redo, historyIndex, history } = useWhiteboardStore()

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10
                    flex items-center gap-1 px-3 py-2
                    bg-white rounded-xl shadow-lg border border-gray-200">
            <button
                onClick={undo}
                disabled={historyIndex === 0}
                title="Undo (Ctrl+Z)"
                className="p-2 rounded-lg transition-colors text-gray-600
                   hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <Undo2 size={18} />
            </button>

            <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                title="Redo (Ctrl+Y)"
                className="p-2 rounded-lg transition-colors text-gray-600
                   hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <Redo2 size={18} />
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

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