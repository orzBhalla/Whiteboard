import useWhiteboardStore from '../store/useWhiteboardStore'

const STROKE_WIDTHS = [2, 4, 6]
const FONT_SIZES = [16, 20, 28, 36]
const FILL_STYLES = [
    { id: 'none', label: 'None' },
    { id: 'hachure', label: 'Hachure' },
    { id: 'solid', label: 'Solid' },
]
const COLORS = [
    '#000000', '#ef4444', '#f97316',
    '#22c55e', '#3b82f6', '#a855f7',
]

export default function PropertiesPanel() {
    const {
        tool,
        activeStroke, setActiveStroke,
        activeStrokeWidth, setActiveStrokeWidth,
        activeFill, setActiveFill,
        activeTextColor, setActiveTextColor,
        activeFontSize, setActiveFontSize,
    } = useWhiteboardStore()

    const isShape = ['rect', 'circle'].includes(tool)    
    const isStroke = ['rect', 'circle', 'line', 'arrow'].includes(tool)  
    const isPen = tool === 'pen'
    const isText = tool === 'text'

    if (tool === 'eraser') return null

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10
                    flex items-center gap-4 px-5 py-3
                    bg-white rounded-xl shadow-lg border border-gray-200">

            {/* Stroke / Text Color */}
            {(isPen || isStroke) && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">Stroke</span>
                    <div className="flex gap-1">
                        {COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => setActiveStroke(color)}
                                style={{ background: color }}
                                className={`w-5 h-5 rounded-full border-2 transition-all
                  ${activeStroke === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isText && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">Color</span>
                    <div className="flex gap-1">
                        {COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => setActiveTextColor(color)}
                                style={{ background: color }}
                                className={`w-5 h-5 rounded-full border-2 transition-all
                  ${activeTextColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Stroke Width */}
            {(isPen || isStroke) && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">Size</span>
                    <div className="flex gap-1">
                        {STROKE_WIDTHS.map((w) => (
                            <button
                                key={w}
                                onClick={() => setActiveStrokeWidth(w)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                  ${activeStrokeWidth === w ? 'bg-gray-900' : 'hover:bg-gray-100'}`}
                            >
                                <div
                                    style={{ height: w, width: 16, background: activeStrokeWidth === w ? 'white' : 'black', borderRadius: 99 }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Fill Style - shapes only */}
            {isShape && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">Fill</span>
                    <div className="flex gap-1">
                        {FILL_STYLES.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setActiveFill(id)}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors
                  ${activeFill === id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Font Size */}
            {isText && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">Size</span>
                    <div className="flex gap-1">
                        {FONT_SIZES.map((size) => (
                            <button
                                key={size}
                                onClick={() => setActiveFontSize(size)}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors
                  ${activeFontSize === size ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}