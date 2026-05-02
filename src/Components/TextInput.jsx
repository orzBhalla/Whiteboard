import { useEffect, useRef } from 'react'
import useWhiteboardStore from '../store/useWhiteboardStore'

export default function TextInput() {
    const { editingText, commitText, cancelText, activeTextColor, activeFontSize } = useWhiteboardStore()
    const inputRef = useRef(null)

    useEffect(() => {
        if (editingText) {
            setTimeout(() => inputRef.current?.focus(), 0)
        }
    }, [editingText])

    if (!editingText) return null

    const handleKeyDown = (e) => {
        e.stopPropagation()
        if (e.key === 'Enter') commitText(e.target.value, { activeTextColor, activeFontSize })
        if (e.key === 'Escape') cancelText()
    }

    const handleBlur = (e) => {
        commitText(e.target.value, { activeTextColor, activeFontSize })
    }

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998, pointerEvents: 'none' }}>
            <input
                ref={inputRef}
                type="text"
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                    position: 'fixed',
                    top: editingText.y,
                    left: editingText.x,
                    fontSize: `${activeFontSize}px`,
                    fontFamily: 'Caveat',
                    color: activeTextColor,
                    border: 'none',
                    outline: '1px dashed #aaa',
                    background: 'transparent',
                    minWidth: '100px',
                    zIndex: 9999,
                    pointerEvents: 'all',
                }}
            />
        </div>
    )
}