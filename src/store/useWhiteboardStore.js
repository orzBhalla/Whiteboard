import { create } from 'zustand'
import { nanoid } from 'nanoid'

const randomSeed = () => Math.floor(Math.random() * 10000) + 1;

const useWhiteboardStore = create((set) => ({
    tool: null,
    elements: [],
    history: [[]],
    historyIndex: 0,
    currentElement: null,
    editingText: null,
    activeStroke: '#000000',
    activeStrokeWidth: 2,
    activeFill: 'none',
    activeTextColor: '#000000',
    activeFontSize: 20,
    stagePos: { x: 0, y: 0 },
    stageScale: 1,

    setTool: (tool) => set({ tool }),
    setActiveStroke: (color) => set({ activeStroke: color }),
    setActiveStrokeWidth: (width) => set({ activeStrokeWidth: width }),
    setActiveFill: (fill) => set({ activeFill: fill }),
    setActiveTextColor: (color) => set({ activeTextColor: color }),
    setActiveFontSize: (size) => set({ activeFontSize: size }),
    setStagePos: (pos) => set({ stagePos: pos }),
    setStageScale: (scale) => set({ stageScale: scale }),

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
        const newElements = [...state.elements, state.currentElement]
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newElements]
        return {
            elements: newElements,
            currentElement: null,
            history: newHistory,
            historyIndex: newHistory.length - 1,
        }
    }),

    eraseElement: (id) => set((state) => {
        const newElements = state.elements.filter((el) => el.id !== id)
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newElements]
        return {
            elements: newElements,
            history: newHistory,
            historyIndex: newHistory.length - 1,
        }
    }),

    startEditingText: (x, y) => set({
        editingText: { id: nanoid(), x, y }
    }),

    commitText: (text, styles) => set((state) => {
        if (!text.trim()) return { editingText: null }
        const newElements = [
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
        ]
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newElements]
        return {
            elements: newElements,
            editingText: null,
            history: newHistory,
            historyIndex: newHistory.length - 1,
        }
    }),

    cancelText: () => set({ editingText: null }),

    undo: () => set((state) => {
        if (state.historyIndex === 0) return {}
        const newIndex = state.historyIndex - 1
        return {
            historyIndex: newIndex,
            elements: state.history[newIndex],
        }
    }),

    redo: () => set((state) => {
        if (state.historyIndex === state.history.length - 1) return {}
        const newIndex = state.historyIndex + 1
        return {
            historyIndex: newIndex,
            elements: state.history[newIndex],
        }
    }),

    resetView: () => set({ stagePos: { x: 0, y: 0 }, stageScale: 1 }),
}))

export default useWhiteboardStore