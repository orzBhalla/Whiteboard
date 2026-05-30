import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { ArrowLeft, Users } from 'lucide-react'
import WhiteboardCanvas from '../Components/Canvas'
import Toolbar from '../Components/Toolbar'
import TextInput from '../Components/TextInput'
import PropertiesPanel from '../Components/PropertiesPanel'
import ExportMenu from '../Components/ExportMenu'
import useWhiteboardStore from '../store/useWhiteboardStore'
import useAuthStore from '../store/useAuthStore'
import api from '../lib/axios'

export default function Canvas() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { token } = useAuthStore()

    const { elements, currentElement, setElements } = useWhiteboardStore()

    const socketRef = useRef(null)
    const saveTimerRef = useRef(null)
    const isInitialLoadRef = useRef(true)
    const hasDrawnRef = useRef(false)

    const [canvasName, setCanvasName] = useState('')
    const [roomUsers, setRoomUsers] = useState([])
    const [cursors, setCursors] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Load canvas from DB
    useEffect(() => {
        const fetchCanvas = async () => {
            try {
                const { data } = await api.get(`/canvases/${id}`)
                setCanvasName(data.canvas.name)
                setElements(data.canvas.elements)
                isInitialLoadRef.current = false
            } catch (err) {
                setError('Canvas not found or access denied')
            } finally {
                setLoading(false)
            }
        }
        fetchCanvas()
    }, [id])

    // Setup socket connection
    useEffect(() => {
        const socket = io(import.meta.env.VITE_SOCKET_URL, {
            auth: { token }
        })

        socketRef.current = socket

        socket.on('connect', () => {
            socket.emit('join-canvas', id)
        })

        // Receive drawing updates from others
        socket.on('drawing-update', ({ elements }) => {
            setElements(elements)
        })

        // Receive cursor positions from others
        socket.on('cursor-move', ({ userId, name, x, y }) => {
            setCursors(prev => ({ ...prev, [userId]: { name, x, y } }))
        })

        // Receive room users list
        socket.on('room-users', (users) => {
            setRoomUsers(users)
        })

        // Cleanup on unmount
        return () => {
            socket.emit('leave-canvas', id)
            socket.disconnect()
        }
    }, [id, token])

    // Only broadcast + save when drawing is COMPLETED (currentElement goes null)
    useEffect(() => {
        if (currentElement !== null) {
            hasDrawnRef.current = true  // ← user started drawing
            return
        }
        if (!socketRef.current) return
        if (!hasDrawnRef.current) return

        // Broadcast completed elements to others
        socketRef.current.emit('drawing-update', { canvasId: id, elements })

        // Debounced save to DB
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
            socketRef.current?.emit('save-canvas', { canvasId: id, elements })
        }, 2000)

        return () => clearTimeout(saveTimerRef.current)
    }, [currentElement])  // ← trigger when currentElement changes, not elements

    // Broadcast cursor position
    const handleCursorMove = (x, y) => {
        socketRef.current?.emit('cursor-move', { canvasId: id, x, y })
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading canvas...</p>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-red-500 text-sm">{error}</p>
        </div>
    )

    return (
        <div className="w-screen h-screen overflow-hidden bg-gray-50 relative">

            {/* Back button */}
            <button
                onClick={() => navigate('/dashboard')}
                className="fixed top-4 left-4 z-10 flex items-center gap-1.5
                   bg-white border border-gray-200 px-3 py-2 rounded-lg
                   text-sm text-gray-600 hover:bg-gray-50 shadow-sm"
            >
                <ArrowLeft size={16} />
                {canvasName}
            </button>

            {/* Online users */}
            <div className="fixed top-4 right-4 z-10 flex items-center gap-2
                      bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm">
                <Users size={14} className="text-gray-400" />
                <div className="flex items-center gap-1">
                    {roomUsers.map((user) => (
                        <div
                            key={user.id}
                            title={user.name}
                            className="w-6 h-6 rounded-full bg-gray-900 text-white
                         text-xs flex items-center justify-center font-medium"
                        >
                            {user.name[0].toUpperCase()}
                        </div>
                    ))}
                </div>
                <span className="text-xs text-gray-400">{roomUsers.length} online</span>
            </div>

            {/* Toolbar */}
            <Toolbar />

            {/* Canvas */}
            <WhiteboardCanvas onCursorMove={handleCursorMove} cursors={cursors} />

            {/* Other components */}
            <TextInput />
            <PropertiesPanel />

            {/* Live cursors */}
            {Object.entries(cursors).map(([userId, cursor]) => (
                <div
                    key={userId}
                    style={{
                        position: 'fixed',
                        left: cursor.x,
                        top: cursor.y,
                        pointerEvents: 'none',
                        zIndex: 50,
                        transform: 'translate(-2px, -2px)'
                    }}
                >
                    {/* Cursor dot */}
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    {/* Name label */}
                    <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5
                          rounded-md mt-1 whitespace-nowrap">
                        {cursor.name}
                    </div>
                </div>
            ))}

        </div>
    )
}