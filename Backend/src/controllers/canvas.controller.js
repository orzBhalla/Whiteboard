import * as canvasModel from '../models/canvas.model.js'
import * as userModel from '../models/user.model.js'

export const getAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1

    try {
        const [owned, shared, totalOwned, totalShared] = await Promise.all([
            canvasModel.findAllOwnedByUser(req.user.id, page),
            canvasModel.findAllSharedWithUser(req.user.id, page),
            canvasModel.countOwnedByUser(req.user.id),
            canvasModel.countSharedWithUser(req.user.id),
        ])

        res.json({
            owned,
            shared,
            pagination: {
                page,
                totalPages: Math.ceil(Math.max(totalOwned, totalShared) / 10)
            }
        })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
}

export const getOne = async (req, res) => {
    try {
        const canvas = await canvasModel.findById(req.params.id)
        if (!canvas) return res.status(404).json({ error: 'Canvas not found' })

        const isOwner = canvas.ownerId === req.user.id
        const isShared = canvas.shares.some(s => s.userId === req.user.id)

        if (!isOwner && !isShared)
            return res.status(403).json({ error: 'Access denied' })

        res.json({ canvas, isOwner })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
}

export const create = async (req, res) => {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Name required' })

    try {
        const canvas = await canvasModel.createCanvas(name, req.user.id)
        res.status(201).json({ canvas })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
}

export const update = async (req, res) => {
    const { elements, thumbnail } = req.body

    try {
        const canvas = await canvasModel.findById(req.params.id)
        if (!canvas) return res.status(404).json({ error: 'Canvas not found' })

        const isOwner = canvas.ownerId === req.user.id
        const isShared = await canvasModel.findShare(req.params.id, req.user.id)

        if (!isOwner && !isShared)
            return res.status(403).json({ error: 'Access denied' })

        const updated = await canvasModel.updateCanvas(req.params.id, { elements, thumbnail })
        res.json({ canvas: updated })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
}

export const remove = async (req, res) => {
    try {
        const canvas = await canvasModel.findById(req.params.id)
        if (!canvas) return res.status(404).json({ error: 'Canvas not found' })

        if (canvas.ownerId !== req.user.id)
            return res.status(403).json({ error: 'Only owner can delete' })

        await canvasModel.deleteCanvas(req.params.id)
        res.json({ message: 'Canvas deleted' })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
}

export const share = async (req, res) => {
    const { email } = req.body

    try {
        const canvas = await canvasModel.findById(req.params.id)
        if (!canvas) return res.status(404).json({ error: 'Canvas not found' })

        if (canvas.ownerId !== req.user.id)
            return res.status(403).json({ error: 'Only owner can share' })

        const userToShare = await userModel.findByEmail(email)
        if (!userToShare) return res.status(404).json({ error: 'User not found' })

        if (userToShare.id === req.user.id)
            return res.status(400).json({ error: 'Cannot share with yourself' })

        await canvasModel.createShare(req.params.id, userToShare.id)
        res.json({ message: `Canvas shared with ${userToShare.name}` })
    } catch (err) {
        if (err.code === 'P2002')
            return res.status(400).json({ error: 'Already shared with this user' })
        res.status(500).json({ error: 'Server error' })
    }
}

export const removeShare = async (req, res) => {
    try {
        const canvas = await canvasModel.findById(req.params.id)
        if (!canvas) return res.status(404).json({ error: 'Canvas not found' })

        if (canvas.ownerId !== req.user.id)
            return res.status(403).json({ error: 'Only owner can remove shares' })

        await canvasModel.deleteShare(req.params.id, req.params.userId)
        res.json({ message: 'Share removed' })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
}