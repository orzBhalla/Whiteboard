// Export as PNG
export function exportAsPNG(stageRef) {
    if (!stageRef?.current) return

    const stage = stageRef.current

    // Temporarily reset position and scale for clean export
    const oldScale = stage.scaleX()
    const oldPos = stage.position()

    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })

    const dataURL = stage.toDataURL({ pixelRatio: 2 }) // 2x for retina

    // Restore original position and scale
    stage.scale({ x: oldScale, y: oldScale })
    stage.position(oldPos)

    // Trigger download
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = dataURL
    link.click()
}

// Export as JSON
export function exportAsJSON(elements) {
    const json = JSON.stringify({ elements }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.download = 'whiteboard.json'
    link.href = url
    link.click()

    URL.revokeObjectURL(url)
}

// Import from JSON
export function importFromJSON(file, setElements) {
    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const { elements } = JSON.parse(e.target.result)
            setElements(elements)
        } catch {
            alert('Invalid whiteboard file!')
        }
    }
    reader.readAsText(file)
}