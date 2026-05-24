import jwt from 'jsonwebtoken'
import redis from '../lib/redis.js'
import * as canvasModel from '../models/canvas.model.js'

export function initSockets(io) {

    // Auth middleware for sockets
    io.use((socket, next) => {
        const token = socket.handshake.auth.token
        if (!token) return next(new Error('No token'))

        try {
            const user = jwt.verify(token, process.env.JWT_SECRET)
            socket.user = user
            next()
        } catch {
            next(new Error('Invalid token'))
        }
    })

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name}`)

        // Join a canvas room
        socket.on('join-canvas', async (canvasId) => {
            socket.join(canvasId)
            socket.currentCanvas = canvasId   // ← track which canvas this socket is in

            await redis.sAdd(`canvas:${canvasId}`, JSON.stringify({
                id: socket.user.id,
                name: socket.user.name,
            }))

            const members = await redis.sMembers(`canvas:${canvasId}`)
            const users = members.map(m => JSON.parse(m))

            io.to(canvasId).emit('room-users', users)
            console.log(`${socket.user.name} joined canvas ${canvasId}`)
        })

        // Broadcast drawing updates to others in room
        socket.on('drawing-update', ({ canvasId, elements }) => {
            socket.to(canvasId).emit('drawing-update', { elements })
        })

        // Broadcast cursor position to others in room
        socket.on('cursor-move', ({ canvasId, x, y }) => {
            socket.to(canvasId).emit('cursor-move', {
                userId: socket.user.id,
                name: socket.user.name,
                x,
                y,
            })
        })

        // Save canvas to DB
        socket.on('save-canvas', async ({ canvasId, elements }) => {
            try {
                await canvasModel.updateCanvas(canvasId, { elements })
                socket.emit('canvas-saved')    // ← confirm save to sender
            } catch (err) {
                console.error('Save error:', err)
                socket.emit('save-error', { error: 'Failed to save' })
            }
        })

        // Leave canvas room
        socket.on('leave-canvas', async (canvasId) => {
            await leaveRoom(socket, io, canvasId)
        })

        // Handle disconnect — clean up room automatically
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.name}`)
            if (socket.currentCanvas) {
                await leaveRoom(socket, io, socket.currentCanvas)
            }
        })
    })
}

// Helper — reused by both leave-canvas and disconnect
async function leaveRoom(socket, io, canvasId) {
    socket.leave(canvasId)

    await redis.sRem(`canvas:${canvasId}`, JSON.stringify({
        id: socket.user.id,
        name: socket.user.name,
    }))

    const remaining = await redis.sMembers(`canvas:${canvasId}`)

    if (remaining.length === 0) {
        await redis.del(`canvas:${canvasId}`)   // cleanup empty room
    } else {
        const users = remaining.map(m => JSON.parse(m))
        io.to(canvasId).emit('room-users', users)
    }

    console.log(`${socket.user.name} left canvas ${canvasId}`)
}