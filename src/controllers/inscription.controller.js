//  TODO: Implementar métodos: getInscriptionsByEventId, getInscriptionsByUserId, newInscription, deleteInscription, editInscription

import bcrypt from 'bcryptjs';
import { generateTokenAccess } from '../libs/jsonwebtoken.js';
import { sendEmailVerification, sendNewPassword } from '../services/mailing.js';
import { randomPinNumber } from '../utils/randomGenerator.js';
import Event from '../models/event.model.js'
import Inscription from '../models/inscription.model.js';
import User from '../models/user.model.js';


export const newInscription = async (req, res) => {

    const { eventId, premiumOnline, inPlace, description, firstname, lastname, email } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({
            success: false,
            message: 'Event not found!'
        })

        let user = await User.findOne({ email });
        if (!user) {
            // lógica del registro
            const pin = randomPinNumber()
            const salt = await bcrypt.hash(pin, 10);
            const createdUser = new User({
                firstname,
                lastname,
                username: email,
                email,
                password: salt,
                emails: [{ emailUrl: email, emailDescription: 'Home' }],
                phones: [{ phoneNumber: '', phoneDescription: '' }],
                social: [{ media: '', user: '' }],
                address: {
                    streetaddress: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: '',
                },
            });
            const newUser = await createdUser.save();
            const tokenAccess = await generateTokenAccess({ _id: newUser._id });
            sendEmailVerification(email, tokenAccess);
            sendNewPassword(email, newPin);

            user = { ...newUser };
            // para tener después el id
        }

        // Lógica de inscripción - aquí tenemos user y event
        const inscription = new Inscription({
            ...req.body,
            userId: user._id,
        })
        await inscription.save()

        return res.status(200).json(
            {
                success: true,
                message: 'Inscription registered successfully.',
            }
        );

    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });
    }
}



export const getInscriptionsByEventId = async (req, res) => {
    return res.status(404).json(
        {
            success: false,
            message: 'Method not implemented',
            body: req.body,
        }
    );
}
export const getInscriptionsByUserId = async (req, res) => {
    return res.status(404).json(
        {
            success: false,
            message: 'Method not implemented',
            body: req.body,
        }
    );
}
export const deleteInscription = async (req, res) => {
    return res.status(404).json(
        {
            success: false,
            message: 'Method not implemented',
            body: req.body,
        }
    );
}
export const editInscription = async (req, res) => {
    return res.status(404).json(
        {
            success: false,
            message: 'Method not implemented',
            body: req.body,
        }
    );
}