import mongoose from 'mongoose';

const edusourceScheme = mongoose.Schema({
  title: {
    type: String,
    maxLenght: 50,
    required: true,
  },
  resourceURL: {
    type: String,
    maxLenght: 100,
    required: true,
  },
  promoterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  autors: [
    {
      autorName: {
        type: String,
      },
      autorSocial: [
        {
          media: {
            type: String,
            maxLenght: 30,
          },
          user: {
            type: String,
            maxLenght: 30,
          },
        },
      ],
    },
  ],
  language: {
    type: String,
    maxLenght: 10,
    required: true,
  },
  level: {
    type: String,
    maxLenght: 10,
  },
  discipline: {
    type: String,
    maxLenght: 50,
    required: true,
  },

  type: {
    type: String,
    maxLenght: 50,
  },
  link: {
    type: String,
    maxLenght: 50,
  },
  linktype: {
    type: String,
    maxLenght: 50,
  },
  description: {
    type: String,
  },
  picture: {
    fileName: {
      type: String,
      required: false,
    },

    uploadTime: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      maxLenght: 20,
    },
  },
  licence: {
    type: String,
    maxLenght: 50,
  },
  date: {
    type: Date,
  },
  valorations: [
    {
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
