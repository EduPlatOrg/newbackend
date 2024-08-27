import mongoose from 'mongoose';

const edusourceSchema = mongoose.Schema({
  title: {
    type: String,
    maxLength: 200,
    required: true,
  },
  externalLink: {
    type: String,
    maxLength: 200,
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
    maxLength: 100,
    required: true,
  },
  range: [{ type: Number }],
  level: {
    type: String,
    maxLength: 100,
  },
  discipline: {
    type: String,
    maxLength: 200,
    required: true,
  },
  subDiscipline: [
    {
      type: String,
      maxLength: 200,
    },
  ],
  link: {
    type: String,
    maxLength: 200,
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
    maxLength: 200,
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
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
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