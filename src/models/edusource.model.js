import mongoose from 'mongoose';

const edusourceScheme = mongoose.Schema({
  title: {
    type: String,
    maxLenght: 50,
    required: true,
  },
  externalLink: {
    type: String,
    maxLenght: 100,
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  autor: {
    autorName: {
      type: String,
    },

    media: {
      type: String,
      maxLenght: 30,
    },
    user: {
      type: String,
      maxLenght: 30,
    },
  },

  language: {
    type: String,
    maxLenght: 10,
    required: true,
  },
  level: {
    type: String,
    maxLenght: 10,
  },
  discipline: [
    {
      type: String,
      maxLenght: 50,
      required: true,
    },
  ],

  subDicipline: [
    {
      type: String,
      maxLenght: 50,
    },
  ],
  link: {
    type: String,
    maxLenght: 50,
  },

  description: {
    type: String,
  },
  image: {
    type: String,
    required: false,
  },

  licence: {
    type: String,
    maxLenght: 50,
  },
  date: {
    type: Date,
  },
  pdfDocument: {
    type: String,
  },
  valorations: [
    {
      // TODO: cambiar por id de mongo
      senderId: {
        type: String,
        maxLenght: 500,
      },
      value: {
        type: Number,
      },
      comment: {
        type: String,
        maxLenght: 500,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      accepted: {
        type: Boolean,
        default: false,
      },
      rejected: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

export default mongoose.model('Edusource', edusourceScheme);

// alvaro serra
// 18:52
// Lista de categorias eduplat.
// Artes
// TICS    Informática  Tecnología      TICS    TEPS TRICS
// Lenguas     - Idiomas- literatura
// Matemáticas
// Ciencias Naturales
// Ciencias Sociales
// Salud–     NB Educación Física. Educación mental
// Psicopedagogía- Orientación Educativa — psicopedagogía, pedagogía, funciones ejecutivas, orientación, ESE, inclusión, evaluación, metodologías activas
// Varias categorías
// Otras Categorías
