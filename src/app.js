import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from './db.js';
import 'dotenv/config';

import userRouter from './routes/user.routes.js';
import edusourceRouter from './routes/edusource.routes.js';
import conversationRouter from './routes/conversation.routes.js';
import collectionRouter from './routes/collection.routes.js';
import mailingRouter from './routes/mailing.routes.js';
import eventRouter from './routes/event.routes.js';
import inscriptionRouter from './routes/inscription.routes.js';
import valorationRouter from './routes/valoration.routes.js';

const port = process.env.PORT || 4000;
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:4000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.get('/helper', (_req, res) => {
  res.status(200).send('helper');
});

app.use('/v1/user', userRouter);
app.use('/v1/edusource', edusourceRouter);
app.use('/v1/conversation', conversationRouter);
app.use('/v1/collection', collectionRouter);
app.use('/v1/contact', mailingRouter);
app.use('/v1/events', eventRouter);
app.use('/v1/inscriptions', inscriptionRouter);
app.use('/v1/valorations', valorationRouter);

connectDB();

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
