import { Router } from 'express';

const router = Router();


router.get('/getEventById/:id', (req, res) => {
    return res.json({
        params: req.params,
        body: req.body,
    })
    
});

export default router;
