import rough from 'roughjs/bundled/rough.esm'

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
const rc = rough.svg(svg)

function extractPathData(node) {
    const paths = node.querySelectorAll('path')
    return Array.from(paths).map((p) => p.getAttribute('d')).join(' ')
}

function getOptions(stroke, strokeWidth, fill, seed) {
    return {
        roughness: 1.5,
        seed,                         
        stroke,
        strokeWidth,
        fill: fill === 'none' ? undefined : stroke,
        fillStyle: fill === 'none' ? 'solid' : fill,
    }
}

export function getRoughRect(x, y, width, height, stroke, strokeWidth, fill, seed) {
    const node = rc.rectangle(x, y, width, height, getOptions(stroke, strokeWidth, fill, seed))
    return extractPathData(node)
}

export function getRoughCircle(x, y, width, height, stroke, strokeWidth, fill, seed) {
    const node = rc.ellipse(
        x + width / 2,
        y + height / 2,
        Math.abs(width),
        Math.abs(height),
        getOptions(stroke, strokeWidth, fill, seed)
    )
    return extractPathData(node)
}

export function getRoughLine(x1, y1, x2, y2, stroke, strokeWidth, seed) {
    const node = rc.line(x1, y1, x2, y2, { roughness: 1.5, seed, stroke, strokeWidth })
    return extractPathData(node)
}

export function getRoughArrow(x1, y1, x2, y2, stroke, strokeWidth, seed) {
    const dx = x2 - x1
    const dy = y2 - y1
    const angle = Math.atan2(dy, dx)
    const headLen = 15

    const ax1 = x2 - headLen * Math.cos(angle - Math.PI / 6)
    const ay1 = y2 - headLen * Math.sin(angle - Math.PI / 6)
    const ax2 = x2 - headLen * Math.cos(angle + Math.PI / 6)
    const ay2 = y2 - headLen * Math.sin(angle + Math.PI / 6)

    const opts = { roughness: 1.5, seed, stroke, strokeWidth }
    const line = rc.line(x1, y1, x2, y2, opts)
    const head1 = rc.line(x2, y2, ax1, ay1, opts)
    const head2 = rc.line(x2, y2, ax2, ay2, opts)

    return [line, head1, head2].map(extractPathData).join(' ')
}