import express from 'express'
import { register, verifyAccount, login, forgotPassword, verifyPasswordResetToken, updatePassword, user, admin } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Rutas de autenticación y registro de usuario
router.post('/register', register)
router.get('/verify/:token', verifyAccount)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)

router.route('/forgot-password/:token')
    .get(verifyPasswordResetToken)
    .post(updatePassword)

// Área privada - requiere un JWT
router.get('/user', authMiddleware, user)
router.get('/admin', authMiddleware, admin)

export default router