import { Router } from 'express';
import { supportMail } from '../controllers/mailing.controller.js';

const router = Router();


router.post("/support",supportMail)

export default router;

