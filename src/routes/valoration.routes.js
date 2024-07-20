import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { asignNewValoration } from '../controllers/valoration.controller.js';

const router = Router();

router.use(authRequired);

router.post('/newValoration', asignNewValoration);

export default router;
