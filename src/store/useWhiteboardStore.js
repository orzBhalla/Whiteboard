import { create } from 'zustand'
import { nanoid } from 'nanoid'

const useWhiteboardStore = create((set) => ({
    tool: null,
    elements: [],
    currentElement: null,

    setTool: (tool) => set({ tool }),

    startElement: (point, tool) => set({
        currentElement: tool === 'pen'
            ? { id: nanoid(), type: 'pen', points: [point] }
            : { id: nanoid(), type: tool, x: point[0], y: point[1], width: 0, height: 0 }
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
}))

export default useWhiteboardStore