import { Router } from 'express';
import { deleteEvent, editEvent, getEventById, getAllEvents, newEvent } from '../controllers/event.controller.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

// ! AQUI LAS RUTAS QUE NO REQUIRAN DE AUTENTICACION
router.get('/getEventById/:id', getEventById);

router.get('/all', getAllEvents);


router.use(authRequired);
// ! AQUI LAS RUTAS QUE REQUIERAN DE AUTENTICACION

router.post('/newEvent', newEvent);

router.patch('/editEvent/:id', editEvent);

router.delete('/deleteEvent/:id', deleteEvent);

export default router;
