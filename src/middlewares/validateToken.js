import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const authRequired = (req, res, next) => {
  console.log(req.cookies, '<-- req.cookies');
  const { token } = req.cookies;

  if (!token || token === '')
    return res.status(401).json({ message: 'No autorizado' });

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'No autorizado' });

    req.user = user;
    console.log(req.user, '<-- req.user');

    next();
  });
};
