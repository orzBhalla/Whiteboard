import { useState, useRef } from 'react'
import { Download, ChevronDown, Upload } from 'lucide-react'
import useWhiteboardStore from '../store/useWhiteboardStore'
import { exportAsPNG, exportAsJSON, importFromJSON } from '../utils/exportCanvas'

export default function ExportMenu() {
    const [open, setOpen] = useState(false)
    const fileInputRef = useRef(null)
    const { stageRef, elements, setElements } = useWhiteboardStore()

    const handlePNG = () => {
        exportAsPNG(stageRef)
        setOpen(false)
    }

    const handleJSON = () => {
        exportAsJSON(elements)
        setOpen(false)
    }

    const handleImport = (e) => {
        const file = e.target.files[0]
        if (file) importFromJSON(file, setElements)
        setOpen(false)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm
                   font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
                <Download size={16} />
                Export
                <ChevronDown size={14} />
            </button>

            {open && (
                <>
                    {/* Backdrop to close on outside click */}
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute right-0 top-full mt-2 z-30
                          bg-white rounded-xl shadow-lg border border-gray-200
                          py-1 w-44 overflow-hidden">
                        <button
                            onClick={handlePNG}
                            className="w-full px-4 py-2 text-sm text-left text-gray-700
                         hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Download size={14} />
                            Save as PNG
                        </button>

                        <button
                            onClick={handleJSON}
                            className="w-full px-4 py-2 text-sm text-left text-gray-700
                         hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Download size={14} />
                            Save as JSON
                        </button>

                        <div className="h-px bg-gray-100 my-1" />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-2 text-sm text-left text-gray-700
                         hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Upload size={14} />
                            Load JSON
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </div>
                </>
            )}
        </div>
    )
}