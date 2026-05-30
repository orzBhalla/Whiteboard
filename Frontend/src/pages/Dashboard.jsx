import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Share2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

export default function Dashboard() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    const [owned, setOwned] = useState([])
    const [shared, setShared] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Create canvas
    const [creating, setCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Share canvas
    const [shareCanvasId, setShareCanvasId] = useState(null)
    const [shareEmail, setShareEmail] = useState('')
    const [shareLoading, setShareLoading] = useState(false)
    const [shareError, setShareError] = useState('')
    const [shareSuccess, setShareSuccess] = useState('')

    const fetchCanvases = async (p = 1) => {
        setLoading(true)
        try {
            const { data } = await api.get(`/canvases?page=${p}`)
            setOwned(data.owned)
            setShared(data.shared)
            setTotalPages(data.pagination.totalPages)
        } catch (err) {
            setError('Failed to load canvases')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCanvases(page)
    }, [page])

    const handleCreate = async () => {
        if (!newName.trim()) return
        setCreating(true)
        try {
            const { data } = await api.post('/canvases', { name: newName })
            setNewName('')
            setShowCreateModal(false)
            navigate(`/canvas/${data.canvas.id}`)
        } catch (err) {
            setError('Failed to create canvas')
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this canvas?')) return
        try {
            await api.delete(`/canvases/${id}`)
            fetchCanvases(page)
        } catch (err) {
            setError('Failed to delete canvas')
        }
    }

    const handleShare = async () => {
        if (!shareEmail.trim()) return
        setShareLoading(true)
        setShareError('')
        setShareSuccess('')
        try {
            const { data } = await api.post(`/canvases/${shareCanvasId}/share`, { email: shareEmail })
            setShareSuccess(data.message)
            setShareEmail('')
        } catch (err) {
            setShareError(err.response?.data?.error || 'Failed to share')
        } finally {
            setShareLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-900">Whiteboard</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Hi, {user?.name}</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-sm text-gray-600
                       hover:text-gray-900 transition-colors"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* My Canvases */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-900">My Canvases</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-1.5 bg-gray-900 text-white
                         px-3 py-2 rounded-lg text-sm font-medium
                         hover:bg-gray-700 transition-colors"
                        >
                            <Plus size={16} />
                            New Canvas
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-sm text-gray-400">Loading...</div>
                    ) : owned.length === 0 ? (
                        <div className="text-sm text-gray-400">No canvases yet — create one!</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {owned.map((canvas) => (
                                <CanvasCard
                                    key={canvas.id}
                                    canvas={canvas}
                                    isOwner
                                    onClick={() => navigate(`/canvas/${canvas.id}`)}
                                    onDelete={() => handleDelete(canvas.id)}
                                    onShare={() => {
                                        setShareCanvasId(canvas.id)
                                        setShareError('')
                                        setShareSuccess('')
                                        setShareEmail('')
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Shared With Me */}
                <div className="mb-10">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Shared With Me</h2>
                    {loading ? (
                        <div className="text-sm text-gray-400">Loading...</div>
                    ) : shared.length === 0 ? (
                        <div className="text-sm text-gray-400">No shared canvases yet</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {shared.map((canvas) => (
                                <CanvasCard
                                    key={canvas.id}
                                    canvas={canvas}
                                    isOwner={false}
                                    onClick={() => navigate(`/canvas/${canvas.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100
                         disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100
                         disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Create Canvas Modal */}
            {showCreateModal && (
                <Modal onClose={() => setShowCreateModal(false)}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">New Canvas</h2>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        placeholder="Canvas name"
                        autoFocus
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                       text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4"
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg
                         hover:bg-gray-700 disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Share Canvas Modal */}
            {shareCanvasId && (
                <Modal onClose={() => setShareCanvasId(null)}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Share Canvas</h2>

                    {shareError && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-3">
                            {shareError}
                        </div>
                    )}
                    {shareSuccess && (
                        <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-3">
                            {shareSuccess}
                        </div>
                    )}

                    <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                        placeholder="Enter email to share with"
                        autoFocus
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                       text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4"
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShareCanvasId(null)}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={shareLoading}
                            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg
                         hover:bg-gray-700 disabled:opacity-50"
                        >
                            {shareLoading ? 'Sharing...' : 'Share'}
                        </button>
                    </div>
                </Modal>
            )}

        </div>
    )
}

// Canvas Card Component
function CanvasCard({ canvas, isOwner, onClick, onDelete, onShare }) {
    return (
        <div
            onClick={onClick}
            className="bg-white border border-gray-200 rounded-xl p-4
                 hover:shadow-md transition-shadow cursor-pointer group"
        >
            {/* Preview area */}
            <div className="w-full h-32 bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-gray-300 text-xs">No preview</span>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900">{canvas.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {isOwner ? 'You' : canvas.owner.name} ·{' '}
                        {new Date(canvas.updatedAt).toLocaleDateString()}
                    </p>
                </div>

                {isOwner && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onShare() }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                            title="Share"
                        >
                            <Share2 size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete() }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// Modal Component
function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 z-10">
                {children}
            </div>
        </div>
    )
}