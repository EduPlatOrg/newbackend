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
            sendNewPassword(email, pin);

            user = { ...newUser };
            // para tener después el id
        }

        // TODO: añadir inscripcion al usuario
        // TODO: añadir usuario inscrito al evento freeonline

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

// export const getEmailsFromEventByEventId = async....


export const deleteInscription = async (req, res) => {
    // autenticar usuario o admin
    // buscar inscripcion en usuario

    // quitar id de inscripcion en array de eventos
    
    // comprobar si esta procesada. si no, eliminar solo de freeonline
    // buscar en todas las inscripciones del evento y eliminar
    // borrar inscripcion

    return res.status(404).json(
        {
            success: false,
            message: 'Method not implemented',
            body: req.body,
        }
    );
}
export const editInscription = async (req, res) => {
    // autenticar SOLO admin

    // solo si no esta procesada

    return res.status(404).json(
        {
            success: false,
            message: 'Method not implemented',
            body: req.body,
        }
    );
}