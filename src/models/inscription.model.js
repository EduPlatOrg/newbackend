import mongoose from 'mongoose';
const inscriptionScheme = mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Event',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    description: {
      type: String,
      maxLenght: 500,
    },
    inPersonApplication: {
      type: Boolean,
    },
    premiumApplication: {
      type: Boolean,
    },
    shareResources: {
      type: Boolean,
    },
    proccessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Inscription', inscriptionScheme);
