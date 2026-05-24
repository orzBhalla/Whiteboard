import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import authRoutes from './routes/auth.js'
import canvasRoutes from './routes/canvases.js'
import { initSockets } from './sockets/canvas.js'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
    }
})

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/canvases', canvasRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

initSockets(io)

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})