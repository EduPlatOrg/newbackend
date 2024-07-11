import mongoose from 'mongoose';

const userScheme = mongoose.Schema({
  username: {
    type: String,
    maxLenght: 50,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    maxLenght: 50,
    required: true,
    unique: true,
  },

  firstname: {
    type: String,
    maxlenght: 50,
    required: true,
  },

  lastname: {
    type: String,
    maxlenght: 50,
    required: true,
  },

  publicData: {
    name: { type: Boolean, default: true },
    emails: { type: Boolean, default: true },
    address: { type: Boolean, default: true },
    phones: { type: Boolean, default: true },
    social: { type: Boolean, default: true },
    lastLogin: { type: Boolean, default: true },
  },

  password: {
    type: String,
    minlenght: 8,
    maxlenght: 100,
  },

  bio: {
    type: String,
    default: '',
  },

  karma: {
    type: Number,
    default: 0,
  },

  picture: {
    type: String,
    default:
      'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
  },

  job: {
    position: {
      type: String,
      default: 'enter position',
    },
    workplace: {
      type: String,
      default: 'enter workplace',
    },
  },

  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },

  isCompleted: {
    type: Number,
    required: false,
    default: 0,
  },

  emails: [],

  address: [],

  phones: [],

  social: [],

  lastLogin: {
    type: Date,
    default: Date.now,
  },
 
  lang: {
    type: String,
    maxLenght: 6,
    default: 'es',
  },
 
  isLogged: {
    type: Boolean,
    default: false,
  },
 
  isBoss: {
    type: Boolean,
    default: false,
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
 
  favorites: [],
  
  edusources: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edusource',
    }
  ],
});

userScheme.index({ '$**': 'text' });
export default mongoose.model('User', userScheme);
