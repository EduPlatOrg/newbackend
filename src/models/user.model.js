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
  tagline: {
    type: String,
    maxlenght: 340,
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
  palette: {
    key: {
      type: Number,
      default: 0,
    },
    pictureHeader: {
      type: String,
      required: false,
      default:
        'https://images.unsplash.com/photo-1540228232483-1b64a7024923?ixlib=rb-1.2.1&auto=format&fit=crop&w=967&q=80',
    },
    primaryColor: {
      type: String,
      maxLenght: 10,
      default: '#231e39',
    },
    secondaryColor: {
      type: String,
      maxLenght: 10,
      default: '#b3b8cd',
    },
    primaryText: {
      type: String,
      maxLenght: 10,
      default: '#b3b8cd',
    },
    secondaryText: {
      type: String,
      maxLenght: 10,
      default: '#1f1a32',
    },
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
  language: {
    type: String,
    maxLenght: 6,
    default: 'ES',
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
