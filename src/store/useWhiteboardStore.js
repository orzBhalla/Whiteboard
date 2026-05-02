import { create } from 'zustand'
import { nanoid } from 'nanoid'

const randomSeed = () => Math.floor(Math.random() * 10000) + 1;

const useWhiteboardStore = create((set) => ({
    tool: null,
    elements: [],
    currentElement: null,
    editingText: null,
    activeStroke: '#000000',
    activeStrokeWidth: 2,
    activeFill: 'none',          // 'none' | 'hachure' | 'solid'
    activeTextColor: '#000000',
    activeFontSize: 20,

    setTool: (tool) => set({ tool }),
    setActiveStroke: (color) => set({ activeStroke: color }),
    setActiveStrokeWidth: (width) => set({ activeStrokeWidth: width }),
    setActiveFill: (fill) => set({ activeFill: fill }),
    setActiveTextColor: (color) => set({ activeTextColor: color }),
    setActiveFontSize: (size) => set({ activeFontSize: size }),

    startElement: (point, tool, styles) => set({
        currentElement: tool === 'pen'
            ? {
                id: nanoid(), type: 'pen', points: [point],
                stroke: styles.activeStroke,
                strokeWidth: styles.activeStrokeWidth,
            }
            : {
                id: nanoid(), type: tool,
                x: point[0], y: point[1], width: 0, height: 0,
                stroke: styles.activeStroke,
                strokeWidth: styles.activeStrokeWidth,
                fill: styles.activeFill,
                seed: randomSeed(),
            }
    }),

    updateElement: (point) => set((state) => {
        if (!state.currentElement) return;
        return {
            currentElement: state.currentElement.type === 'pen'
                ? {
                    ...state.currentElement,
                    points: [...state.currentElement.points, point],
                }
                : {
                    ...state.currentElement,
                    width: point[0] - state.currentElement.x,
                    height: point[1] - state.currentElement.y,
                }
        }
    }),

    endElement: () => set((state) => {
        if (!state.currentElement) return;
        return {
            elements: [...state.elements, state.currentElement],
            currentElement: null,
        }
    }),

    eraseElement: (id) => set((state) => ({
        elements: state.elements.filter(el => el.id !== id)
    })),

    startEditingText: (x, y) => set({
        editingText: { id: nanoid(), x, y }
    }),

    commitText: (text, styles) => set((state) => {
        if (!text.trim()) return { editingText: null }
        return {
            elements: [
                ...state.elements,
                {
                    id: state.editingText.id,
                    type: 'text',
                    x: state.editingText.x,
                    y: state.editingText.y,
                    text,
                    color: styles.activeTextColor,
                    fontSize: styles.activeFontSize,
                }
            ],
            editingText: null
        }
    }),

    cancelText: () => set({ editingText: null }),
}))

export default useWhiteboardStore