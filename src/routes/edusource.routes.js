import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
  deleteEdusource,
  editEdusource,
  getEdusourceById,
  getEdusources,
  newEdusource,
  getOwnResources,
  manageLikes,
} from '../controllers/edusource.controller.js';

const router = Router();

// ruta: /v1/edusource

// ! AQUI LAS RUTAS QUE NO REQUIRAN DE AUTENTICACION
router.get('/all', getEdusources);

router.get('/getEdusourceById/:id', getEdusourceById);

router.use(authRequired);
// ! AQUI LAS RUTAS QUE REQUIERAN DE AUTENTICACION
router.get('/ownResources', getOwnResources);

router.post('/newEdusource', newEdusource);

router.patch('/editEdusource/:id', editEdusource);

router.delete('/deleteEdusource/:id', deleteEdusource);

router.post('/manage-like/:id', manageLikes);

export default router;
