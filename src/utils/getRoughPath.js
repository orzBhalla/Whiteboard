import rough from 'roughjs/bundled/rough.esm'

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
const rc = rough.svg(svg)

const OPTIONS = {
    roughness: 1.5,
    strokeWidth: 2,
    seed: 42,
}

function extractPathData(node) {
    const paths = node.querySelectorAll('path')
    return Array.from(paths).map((p) => p.getAttribute('d')).join(' ')
}

export function getRoughRect(x, y, width, height) {
    const node = rc.rectangle(x, y, width, height, OPTIONS)
    return extractPathData(node)
}

export function getRoughCircle(x, y, width, height) {
    const node = rc.ellipse(
        x + width / 2,
        y + height / 2,
        Math.abs(width),
        Math.abs(height),
        OPTIONS
    )
    return extractPathData(node)
}

export function getRoughLine(x1, y1, x2, y2) {
    const node = rc.line(x1, y1, x2, y2, OPTIONS)
    return extractPathData(node)
}

export function getRoughArrow(x1, y1, x2, y2) {
    const dx = x2 - x1
    const dy = y2 - y1
    const angle = Math.atan2(dy, dx)
    const headLen = 15

    const ax1 = x2 - headLen * Math.cos(angle - Math.PI / 6)
    const ay1 = y2 - headLen * Math.sin(angle - Math.PI / 6)
    const ax2 = x2 - headLen * Math.cos(angle + Math.PI / 6)
    const ay2 = y2 - headLen * Math.sin(angle + Math.PI / 6)

    const line = rc.line(x1, y1, x2, y2, OPTIONS)
    const head1 = rc.line(x2, y2, ax1, ay1, OPTIONS)
    const head2 = rc.line(x2, y2, ax2, ay2, OPTIONS)

    return [line, head1, head2].map(extractPathData).join(' ')
}