import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as userModel from '../models/user.model.js'

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
}

export const register = async (req, res) => {
    const { email, name, password } = req.body

    if (!email || !name || !password)
        return res.status(400).json({ error: 'All fields required' })

    try {
        const existing = await userModel.findByEmail(email)
        if (existing)
            return res.status(400).json({ error: 'Email already in use' })

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await userModel.createUser({ email, name, password: hashedPassword })

        const token = generateToken(user)
        res.status(201).json({ token, user })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password)
        return res.status(400).json({ error: 'All fields required' })

    try {
        const user = await userModel.findByEmail(email)
        if (!user)
            return res.status(400).json({ error: 'Invalid credentials' })

        const valid = await bcrypt.compare(password, user.password)
        if (!valid)
            return res.status(400).json({ error: 'Invalid credentials' })

        const token = generateToken(user)
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
}

export const me = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id)
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json({ user })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
}