import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
  acceptValoration,
  asignNewUserValoration,
  asignNewValoration,
  rejectValoration,
  removeValoration,
} from '../controllers/valoration.controller.js';

const router = Router();

router.use(authRequired);

router.post('/newValoration', asignNewValoration);

router.post('/newUserValoration', asignNewUserValoration);

router.delete('/remove/:id', removeValoration);

router.put('/reject/:id', rejectValoration);

router.put('/accept/:id', acceptValoration);

export default router;
