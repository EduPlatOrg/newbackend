import mongoose from 'mongoose';
const inscriptionScheme = mongoose.Schema({
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
        default: false,
    },
    premiumApplication: {
        type: Boolean,
        default: false,
    },
})

// TODO: añadir index adecuado??

export default mongoose.model('Inscription', inscriptionScheme);