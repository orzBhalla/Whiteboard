import { Pencil, Square, Circle, Minus, Eraser, Type, MoveUpRight, Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Hand } from 'lucide-react'
import useWhiteboardStore from '../store/useWhiteboardStore'

const tools = [
    { id: 'hand', icon: Hand },
    { id: 'pen', icon: Pencil },
    { id: 'rect', icon: Square },
    { id: 'circle', icon: Circle },
    { id: 'line', icon: Minus },
    { id: 'arrow', icon: MoveUpRight },
    { id: 'eraser', icon: Eraser },
    { id: 'text', icon: Type },
]

export default function Toolbar() {
    const {
        tool, setTool,
        undo, redo, historyIndex, history,
        stageScale, setStageScale, setStagePos, resetView,
    } = useWhiteboardStore()

    const zoomIn = () => setStageScale(Math.min(stageScale * 1.2, 5))
    const zoomOut = () => setStageScale(Math.max(stageScale / 1.2, 0.1))

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

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <button onClick={zoomOut} title="Zoom Out" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <ZoomOut size={18} />
            </button>

            <span className="text-xs text-gray-500 w-10 text-center">
                {Math.round(stageScale * 100)}%
            </span>

            <button onClick={zoomIn} title="Zoom In" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <ZoomIn size={18} />
            </button>

            <button onClick={resetView} title="Reset View (Ctrl+0)" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Maximize size={18} />
            </button>

        </div>
    )
}