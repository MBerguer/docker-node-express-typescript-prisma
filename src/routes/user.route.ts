import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { checkRole, checkJwt } from '../middlewares/checks';

const router = Router()

router.get('/', [checkJwt, checkRole(["user", "admin"])], UserController.getUsers)
router.post('/', [checkJwt, checkRole(["admin"]) ], UserController.createUser)
router.get('/:id', [checkJwt, checkRole(["user", "admin"])], UserController.getUser)
router.put('/:id', [checkJwt, checkRole(["admin"])], UserController.updateUser)
router.delete('/:id', [checkJwt, checkRole(["admin"])], UserController.deleteUser)

export default router