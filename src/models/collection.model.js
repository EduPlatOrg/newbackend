import mongoose from 'mongoose';

const collectionScheme = mongoose.Schema({
  title: {
    type: String,
    maxLenght: 50,
    required: true,
  },
  collectionURL: {
    type: String,
    maxLenght: 100,
    required: true,
  },
  promoterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  description: {
    type: String,
  },
  content: [
    {
      type: {
        type: String,
        required: true,
        default: 'header',
      },
      contentId: {
        type: String,
      },
      description: {
        type: String,
      },
      visitedBy: [],
    },
  ],
  picture: {
    type: String,
    required: false,
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

export default mongoose.model('Collection', collectionScheme);
