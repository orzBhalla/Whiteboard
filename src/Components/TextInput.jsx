import { useEffect, useRef } from 'react'
import useWhiteboardStore from '../store/useWhiteboardStore'

export default function TextInput() {
  const { editingText, commitText, cancelText } = useWhiteboardStore()
  const inputRef = useRef(null)

  useEffect(() => {
    if (editingText) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)                        
    }
  }, [editingText])

  if (!editingText) return null

  const handleKeyDown = (e) => {
    e.stopPropagation()            
    if (e.key === 'Enter') commitText(e.target.value)
    if (e.key === 'Escape') cancelText()
  }

  const handleBlur = (e) => {
    commitText(e.target.value)
  }

  return (
    <input
      ref={inputRef}
      type="text"
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        position: 'fixed',
        top: editingText.y,
        left: editingText.x,
        fontSize: '16px',
        fontFamily: 'sans-serif',
        border: 'none',
        outline: '1px dashed #aaa',
        background: 'transparent',
        minWidth: '100px',
        zIndex: 9999,              
        pointerEvents: 'all',     
      }}
    />
  )
}