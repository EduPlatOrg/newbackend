import mongoose from 'mongoose';

const eventScheme = mongoose.Schema({
  title: {
    type: String,
    maxLenght: 80,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    maxLenght: 500, //?
    required: true,
  },
  youtubeUrl: {
    type: String,
    maxLenght: 100,
  },
  mainImage: {
    type: String,
    default:
      'https://upload.wikimedia.org/wikipedia/commons/0/0a/Security_Council_Meeting_Room_--_The_United_Nations_New_York_%28NY%29_April_2016_%2826194758874%29.jpg',
  }, //? image
  pdfDocument: {
    type: String,
  },
  images: [{ type: String }],
  online: {
    type: Boolean,
    default: false,
  },
  inPerson: {
    type: Boolean,
    default: false,
  },
  onlinePremiumPlaces: {
    type: Number,
  }, //? onlinePlaces
  onlineFreePlaces: {
    type: Number,
  }, //? youtubePlaces
  inPersonPlaces: {
    type: Number,
  }, //?availableSeats
  onlineFreeBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  onlinePremiumBookings: [
    {
      type: mongoose.Schema.Types.ObjectId,

      ref: 'User',
    },
  ], //? añadido
  inPersonBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  address: {
    streetaddress: {
      type: String,
      maxLenght: 100,
    },
    city: {
      type: String,
      maxLenght: 50,
    },
    state: {
      type: String,
      maxLenght: 50,
    },
    postalCode: {
      type: Number,
    },
    country: {
      type: String,
      maxLenght: 50,
    },
  },
  price: {
    type: String,
  },
  premiumEventUrl: {
    type: String,
  }, //? zoomUrl
  publicEventUrl: {
    type: String,
  }, //? youtubeUrl
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: Date.now,
  },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

eventScheme.index({ '$**': 'text' });
export default mongoose.model('Event', eventScheme);
