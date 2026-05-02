import { Stage, Layer, Path, Text } from 'react-konva'
import useWhiteboardStore from '../store/useWhiteboardStore'
import { getStrokePath } from '../utils/getStrokePath'
import { getRoughRect, getRoughCircle, getRoughLine, getRoughArrow } from '../utils/getRoughPath'
import { useRef } from 'react'

function renderElement(el, tool, eraseElement) {
    const eraserProps = tool === 'eraser' ? {
        onMouseEnter: () => eraseElement(el.id),
    } : {}

    if (el.type === 'pen') {
        return (
            <Path
                key={el.id}
                data={getStrokePath(el.points)}
                fill={el.stroke}
                {...eraserProps}
            />
        )
    }

    if (el.type === 'rect') {
        const x = el.width < 0 ? el.x + el.width : el.x
        const y = el.height < 0 ? el.y + el.height : el.y
        return (
            <Path
                key={el.id}
                data={getRoughRect(x, y, Math.abs(el.width), Math.abs(el.height), el.stroke, el.strokeWidth, el.fill, el.seed)}
                stroke={el.stroke}
                strokeWidth={1}
                fill={el.fill === 'solid' ? el.stroke : 'transparent'}
                {...eraserProps}
            />
        )
    }

    if (el.type === 'circle') {
        return (
            <Path
                key={el.id}
                data={getRoughCircle(el.x, el.y, el.width, el.height, el.stroke, el.strokeWidth, el.fill, el.seed)}
                stroke={el.stroke}
                strokeWidth={1}
                fill={el.fill === 'solid' ? el.stroke : 'transparent'}
                {...eraserProps}
            />
        )
    }

    if (el.type === 'line') {
        return (
            <Path
                key={el.id}
                data={getRoughLine(el.x, el.y, el.x + el.width, el.y + el.height, el.stroke, el.strokeWidth, el.seed)}
                stroke={el.stroke}
                strokeWidth={1}
                fill="transparent"
                {...eraserProps}
            />
        )
    }

    if (el.type === 'arrow') {
        return (
            <Path
                key={el.id}
                data={getRoughArrow(el.x, el.y, el.x + el.width, el.y + el.height, el.stroke, el.strokeWidth, el.seed)}
                stroke={el.stroke}
                strokeWidth={1}
                fill="transparent"
                {...eraserProps}
            />
        )
    }

    if (el.type === 'text') {
        return (
            <Text
                key={el.id}
                x={el.x}
                y={el.y}
                text={el.text}
                fontSize={el.fontSize}
                fontFamily="Caveat"
                fill={el.color}
                {...eraserProps}
            />
        )
    }
}

export default function Canvas() {
    const width = window.innerWidth
    const height = window.innerHeight
    const isEditingRef = useRef(false)

    const {
        tool, elements, currentElement,
        startElement, updateElement, endElement,
        eraseElement, startEditingText, editingText,
        activeStroke, activeStrokeWidth, activeFill,
        activeTextColor, activeFontSize,
        commitText, cancelText,
    } = useWhiteboardStore()

    const activeStyles = { activeStroke, activeStrokeWidth, activeFill, activeTextColor, activeFontSize }

    const handleMouseDown = (e) => {
        if (tool === 'eraser') return

        if (isEditingRef.current) {
            isEditingRef.current = false
            return
        }

        const pos = e.target.getStage().getPointerPosition()

        if (tool === 'text') {
            isEditingRef.current = true
            startEditingText(pos.x, pos.y)
            return
        }

        startElement([pos.x, pos.y], tool, activeStyles)
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

    const getCursor = () => {
        if (tool === 'eraser') return 'cell'
        if (tool === 'text') return 'text'
        return 'crosshair'
    }

    return (
        <Stage
            width={width}
            height={height}
            style={{ cursor: getCursor(), background: '#F9FAFB' }}
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