import getStroke from 'perfect-freehand'

export function getStrokePath(points, strokeWidth = 2) {
    const options = {
        size: strokeWidth * 2,   
        smoothing: 0.5,
        thinning: 0.5,
        streamline: 0.5,
    }

    const stroke = getStroke(points, options)
    if (!stroke.length) return ''

    const d = stroke.reduce((acc, [x, y], i) => {
        if (i === 0) return `M ${x} ${y}`
        return `${acc} L ${x} ${y}`
    }, '')

    return d + ' Z'
}