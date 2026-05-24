import express from 'express'
import { getAll, getOne, create, update, remove, share, removeShare } from '../controllers/canvas.controller.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateToken)

router.get('/', getAll)
router.get('/:id', getOne)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)
router.post('/:id/share', share)
router.delete('/:id/share/:userId', removeShare)

export default router