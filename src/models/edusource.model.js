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
    socials: [
      {
        media: {
          type: String,
        },
        user: {
          type: String,
        }
      }
    ],
  },

  language: {
    type: String,
    maxLenght: 10,
    required: true,
  },

  range: [{ type: Number }],

  level: {
    type: String,
    maxLenght: 10,
  },

  discipline: {
    type: String,
    maxLenght: 50,
    required: true,
  },
  
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
    default: Date.now()
  },
  
  pdfDocument: {
    type: String,
  },
  
  valorations: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    },
  ],
  
  valorationsAverage: {
    votes: {
      type: Number,
    },
    average: {
      type: Number,
    },
    // calcular en algún momento la media de los votos aceptados, para ofrecer el típico: 4,5/5 - 438 evaluaciones
  }
},);

// edusourceScheme.index({ '$**': 'text' });
edusourceScheme.index(
  {
    "title": "text",
    "autorName": "text",
    "user": "text",
    "subDicipline": "text",
    "description": "text",
    "comment": "text",
  }
)
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
