// * Ruta: '/v1/inscriptions'

import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { deleteInscription, editInscription, getInscriptionsByEventId,  newInscription } from '../controllers/inscription.controller.js';

const router = Router();

// ! AQUI LAS RUTAS QUE NO REQUIRAN DE AUTENTICACION
router.post('/newInscription', newInscription);


router.use(authRequired);
// ! AQUI LAS RUTAS QUE REQUIERAN DE AUTENTICACION
router.get('/getInscriptionsByEventId/:id', getInscriptionsByEventId);

router.delete('/deleteInscription/:id', deleteInscription);

router.patch('/editInscription/:id', editInscription);


export default router;