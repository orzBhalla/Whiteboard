import { Stage, Layer, Path, Rect, Ellipse, Line } from 'react-konva'
import useWhiteboardStore from '../store/useWhiteboardStore'
import { getStrokePath } from '../utils/getStrokePath'

function renderElement(el, tool, eraseElement) {
    const eraserProps = tool === 'eraser' ? {
        onMouseEnter: () => eraseElement(el.id),
        opacity: 1,
    } : {}

    if (el.type === 'pen') {
        return (
            <Path
                key={el.id}
                data={getStrokePath(el.points)}
                fill="black"
                {...eraserProps}
            />
        )
    }

    if (el.type === 'rect') {
        return (
            <Rect
                key={el.id}
                x={el.width < 0 ? el.x + el.width : el.x}
                y={el.height < 0 ? el.y + el.height : el.y}
                width={Math.abs(el.width)}
                height={Math.abs(el.height)}
                stroke="black"
                strokeWidth={2}
                fill="transparent"
                {...eraserProps}
            />
        )
    }

    if (el.type === 'circle') {
        return (
            <Ellipse
                key={el.id}
                x={el.x + el.width / 2}
                y={el.y + el.height / 2}
                radiusX={Math.abs(el.width / 2)}
                radiusY={Math.abs(el.height / 2)}
                stroke="black"
                strokeWidth={2}
                fill="transparent"
                {...eraserProps}
            />
        )
    }

    if (el.type === 'line') {
        return (
            <Line
                key={el.id}
                points={[el.x, el.y, el.x + el.width, el.y + el.height]}
                stroke="black"
                strokeWidth={2}
                {...eraserProps}
            />
        )
    }
}

export default function Canvas() {
    const width = window.innerWidth
    const height = window.innerHeight

    const {
        tool, elements, currentElement,
        startElement, updateElement, endElement, eraseElement
    } = useWhiteboardStore()

    const handleMouseDown = (e) => {
        if (tool === 'eraser') return
        const pos = e.target.getStage().getPointerPosition()
        startElement([pos.x, pos.y], tool)
    }

    const handleMouseMove = (e) => {
        if (!currentElement) return
        const pos = e.target.getStage().getPointerPosition()
        updateElement([pos.x, pos.y])
    }

    const handleMouseUp = () => {
        if (!currentElement) return
        endElement()
    }

    return (
        <Stage
            width={width}
            height={height}
            style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair', background: '#F9FAFB' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <Layer>
                {elements.map((el) => renderElement(el, tool, eraseElement))}
                {currentElement && renderElement(currentElement, tool, eraseElement)}
            </Layer>
        </Stage>
    )
}