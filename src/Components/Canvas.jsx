import { Stage, Layer, Path, Text } from 'react-konva'
import { useRef, useState } from 'react'
import useWhiteboardStore from '../store/useWhiteboardStore'
import { getStrokePath } from '../utils/getStrokePath'
import { getRoughRect, getRoughCircle, getRoughLine, getRoughArrow } from '../utils/getRoughPath'

const MIN_SCALE = 0.1
const MAX_SCALE = 5

function renderElement(el, tool, eraseElement) {
    const eraserProps = tool === 'eraser' ? {
        onMouseEnter: () => eraseElement(el.id),
    } : {}

    if (el.type === 'pen') {
        return (
            <Path
                key={el.id}
                data={getStrokePath(el.points, el.strokeWidth)}
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
    const isPanningRef = useRef(false)    // ← tracks if we're panning
    const lastPosRef = useRef(null)       // ← last mouse position during pan
    const [isSpaceDown, setIsSpaceDown] = useState(false)

    const {
        tool, elements, currentElement,
        startElement, updateElement, endElement,
        eraseElement, startEditingText, editingText,
        activeStroke, activeStrokeWidth, activeFill,
        activeTextColor, activeFontSize,
        stagePos, stageScale, setStagePos, setStageScale,
    } = useWhiteboardStore()

    const activeStyles = { activeStroke, activeStrokeWidth, activeFill, activeTextColor, activeFontSize }

    const handleWheel = (e) => {
        e.evt.preventDefault()
        if (!e.evt.ctrlKey) return

        const stage = e.target.getStage()
        const oldScale = stageScale
        const pointer = stage.getPointerPosition()

        const scaleBy = 1.05
        const newScale = e.evt.deltaY < 0
            ? Math.min(oldScale * scaleBy, MAX_SCALE)
            : Math.max(oldScale / scaleBy, MIN_SCALE)

        const newPos = {
            x: pointer.x - (pointer.x - stagePos.x) * (newScale / oldScale),
            y: pointer.y - (pointer.y - stagePos.y) * (newScale / oldScale),
        }

        setStageScale(newScale)
        setStagePos(newPos)
    }

    const handleKeyDown = (e) => {
        if (e.code === 'Space') setIsSpaceDown(true)
    }
    const handleKeyUp = (e) => {
        if (e.code === 'Space') setIsSpaceDown(false)
    }

    const handleMouseDown = (e) => {
        if (tool === 'hand' || isSpaceDown || e.evt.button === 1) {
            isPanningRef.current = true
            lastPosRef.current = { x: e.evt.clientX, y: e.evt.clientY }
            return
        }

        if (tool === 'eraser') return
        if (isEditingRef.current) {
            isEditingRef.current = false
            return
        }

        const stage = e.target.getStage()
        const pos = stage.getRelativePointerPosition()

        if (tool === 'text') {
            isEditingRef.current = true
            startEditingText(pos.x, pos.y)
            return
        }

        startElement([pos.x, pos.y], tool, activeStyles)
    }

    const handleMouseMove = (e) => {
        if (isPanningRef.current) {
            const dx = e.evt.clientX - lastPosRef.current.x
            const dy = e.evt.clientY - lastPosRef.current.y
            setStagePos({ x: stagePos.x + dx, y: stagePos.y + dy })
            lastPosRef.current = { x: e.evt.clientX, y: e.evt.clientY }
            return
        }

        if (!currentElement) return
        const stage = e.target.getStage()
        const pos = stage.getRelativePointerPosition()  // ← accounts for pan/zoom
        updateElement([pos.x, pos.y])
    }

    const handleMouseUp = () => {
        if (isPanningRef.current) {
            isPanningRef.current = false
            lastPosRef.current = null
            return
        }
        if (!currentElement) return
        endElement()
    }

    const getCursor = () => {
        if (tool === 'hand') return isPanningRef.current ? 'grabbing' : 'grab'
        if (isSpaceDown) return 'grab'
        if (isPanningRef.current) return 'grabbing'
        if (tool === 'eraser') return 'cell'
        if (tool === 'text') return 'text'
        return 'crosshair'
    }

    return (
        <div
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            tabIndex={0}                // ← needed to receive keyboard events
            style={{ outline: 'none' }} // ← hide focus ring
        >
            <Stage
                width={width}
                height={height}
                style={{ cursor: getCursor(), background: '#F9FAFB' }}
                x={stagePos.x}
                y={stagePos.y}
                scaleX={stageScale}
                scaleY={stageScale}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <Layer>
                    {elements.map((el) => renderElement(el, tool, eraseElement))}
                    {currentElement && renderElement(currentElement, tool, eraseElement)}
                </Layer>
            </Stage>
        </div>
    )
}