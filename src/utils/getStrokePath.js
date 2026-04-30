import getStroke from 'perfect-freehand'

const options = {
    size: 4,        // brush size
    smoothing: 0.5, // how smooth the edges are
    thinning: 0.5,  // how much the stroke thins at ends
    streamline: 0.5 // how much to smooth out shaky lines
}

export function getStrokePath(points) {
    const stroke = getStroke(points, options)
    if (!stroke.length) return ''

    const d = stroke.reduce((acc, [x, y], i) => {
        if (i === 0) return `M ${x} ${y}`
        return `${acc} L ${x} ${y}`
    }, '')

    return d + ' Z'
}