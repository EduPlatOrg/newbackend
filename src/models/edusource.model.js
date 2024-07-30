import mongoose from 'mongoose';

const edusourceSchema = mongoose.Schema({
  title: {
    type: String,
    maxLength: 50,
    required: true,
  },
  externalLink: {
    type: String,
    maxLength: 100,
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
    socials: [
      {
        media: {
          type: String,
        },
        user: {
          type: String,
        },
      },
    ],
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
  lang: {
    type: String,
    maxLength: 10,
    required: true,
  },
  range: [{ type: Number }],
  level: {
    type: String,
    maxLength: 10,
  },
  discipline: {
    type: String,
    maxLength: 50,
    required: true,
  },
  subDiscipline: [
    {
      type: String,
      maxLength: 50,
    },
  ],
  link: {
    type: String,
    maxLength: 50,
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
    maxLength: 50,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  pdfDocument: {
    type: String,
  },
  valorations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Valoration',
    },
  ],
  valorationsAverage: {
    votes: {
      type: Number,
    },
    average: {
      type: Number,
    },
  },
  likes: {
    type: Number,
    default: 0,
  },
});

edusourceSchema.index({
  title: 'text',
  autorName: 'text',
  user: 'text',
  subDiscipline: 'text',
  description: 'text',
  comment: 'text',
});

export default mongoose.model('Edusource', edusourceSchema);

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

// 1 Artes
// 2 TICS    Informática  Tecnología      TICS    TEPS TRICS
// 3 Lenguas     - Idiomas- literatura
// 4 Matemáticas
// 5 Ciencias Naturales
// 6 Ciencias Sociales
// 7 Salud–     NB Educación Física. Educación mental
// 8 Psicopedagogía- Orientación Educativa — psicopedagogía, pedagogía, funciones ejecutivas, orientación, ESE, inclusión, evaluación, metodologías activas
// 9 Varias categorías -- no
// 10 Otras Categorías
