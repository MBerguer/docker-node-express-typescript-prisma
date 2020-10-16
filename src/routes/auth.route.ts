import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { checkJwt } from '../middlewares/checks'

const router = Router()

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.put('/logout', [checkJwt], AuthController.logout)
router.put('/refresh-tokens', [checkJwt], AuthController.refreshTokens)
router.put('/forgot-password', [checkJwt], AuthController.forgotPassword)
router.put('/reset-password', [checkJwt], AuthController.refreshTokens)

export default router
