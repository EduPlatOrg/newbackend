import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  username: {
    type: String,
    maxLength: 50,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    maxLength: 50,
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    maxLength: 50,
    required: true,
  },
  lastname: {
    type: String,
    maxLength: 50,
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
    minLength: 8,
    maxLength: 100,
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
    maxLength: 6,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Valoration',
    },
  ],
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edusource',
    },
  ],
  edusources: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edusource',
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
});

userSchema.index({ '$**': 'text' });
export default mongoose.model('User', userSchema);
