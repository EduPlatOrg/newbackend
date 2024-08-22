import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { generateTokenAccess } from '../libs/jsonwebtoken.js';
import { randomPinNumber } from '../utils/randomGenerator.js';

import Inscription from '../models/inscription.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';

import {
    sendAdminMail,
    sendEmailVerification,
    sendInscriptionNotificationEmail,
    sendNewPassword
} from '../services/mailing.js';

import {
    getUnprocessedInscriptions,
    addUserToInPersonEvent,
    addUserToPremiumEvent,
    setUserAsContributorInEvent,
} from '../services/inscription/inscription.services.js';

import {
    availableSeats,
} from '../services/event/event.services.js';


export const newInscription = async (req, res) => {
    const { eventId, premiumOnline, inPlace, firstname, lastname, email } =
        req.body;
    console.log(req.body);
    try {
        const event = await Event.findById(eventId);
        if (!event)
            return res.status(404).json({
                success: false,
                message: 'Event not found!',
            });

        let user = await User.findOne({ email }).populate('inscriptions');
        if (!user) {
            // TODO: esto hay que refactorizarlo
            // lógica del registro
            const pin = randomPinNumber();
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
        // CHECK
        const checkId = new mongoose.Types.ObjectId(eventId);
        let isAlreadyInscribed = false;
        if (user.inscriptions.length > 0) {
            const idExist = user.inscriptions.some((insc) =>
                insc.eventId.equals(checkId)
            );
            isAlreadyInscribed = idExist;
            console.log('isAlrreadyInscribed', isAlreadyInscribed);
        }
        if (isAlreadyInscribed) {
            return res.status(200).json({
                success: false,
                message: 'User already inscribed in this event',
                allreadyInscribed: isAlreadyInscribed,
            });
        }

        const inscription = new Inscription({
            ...req.body,
            userId: user._id,
            inPersonApplication: inPlace,
            premiumApplication: premiumOnline,
        });

        const userWithInscription = await User.findByIdAndUpdate(
            user._id,
            { $push: { inscriptions: inscription._id }, },
            { new: true }
        );
        if (!userWithInscription) {
            return res.status(404).json({
                success: false,
                message: 'User not found!',
            });
        }
        const eventWithUserInscription = await Event.findByIdAndUpdate(
            eventId,
            { $push: { onlineFreeBookings: userWithInscription._id }, },
            { new: true }
        );

        if (!eventWithUserInscription) {
            await User.findByIdAndUpdate(user._id,
                { $pull: { inscriptions: inscription._id }, }
            );
            return res.status(404).json({
                success: false,
                message: 'Event not found!',
            });
        }

        await inscription.save();

        await sendInscriptionNotificationEmail(inscription, eventWithUserInscription, userWithInscription);
        return res.status(200).json({
            success: true,
            message: 'Inscription registered successfully.',
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });
    }
};

export const getInscriptionsByEventId = async (req, res) => {
    const { eventId } = req.params;
    if (!eventId) {
        return res.status(404).json({
            success: false,
            message: 'Invalid request',
        });
    }
    try {
        const inscriptions = await getUnprocessedInscriptions(eventId);
        if (!inscriptions) {
            return res.status(404).json({
                success: false,
                message: 'Inscriptions not found',
                inscriptions: [],
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Inscriptions found',
            inscriptions,
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });
    }
};

export const deleteInscription = async (req, res) => {
    const { inscriptionId } = req.params;
    const { _id } = req.user;
    if (!_id || !inscriptionId) {
        return res.status(404).json({
            success: false,
            message: 'Invalid request or unauthorized',
        });
    }

    try {
        // autenticar usuario o admin
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        const inscription = await Inscription.findById(inscriptionId)
        if (!inscription) {
            return res.status(404).json({
                success: false,
                message: 'Inscription not found',
            });
        }
        if (inscription.userId != _id && !user.isBoss) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        // borrar inscripcion
        // TODO: refactorizar hasta el return
        const deletedInscription = await Inscription.findByIdAndDelete(inscriptionId);
        if (!deletedInscription) {
            return res.status(404).json({
                success: false,
                message: 'Inscription not found',
            });
        }
        const { eventId, userId, proccessed } = deletedInscription;
        // quitar id de inscripcion en array de eventos
        const modifiedUser = await User.findByIdAndUpdate(userId, {
            $pull: { inscriptions: inscriptionId },
        });
        // buscar en todas las inscripciones del evento y eliminar
        const modifiedEvent = await Event.findByIdAndUpdate(eventId, {
            $pull: { onlineFreeBookings: userId },
        });
        // comprobar si esta procesada. si no, eliminar solo de freeonline
        if (proccessed) {
            await Event.findByIdAndUpdate(eventId, {
                $pull: {
                    onlinePremiumBookings: userId,
                    inPersonBookings: userId
                }
            });

            // notificar en caso de que no lo haya eliminado un Boss.
            if (!user.isBoss) {
                const { name, surname, email } = modifiedUser;
                const subject = 'Inscripción eliminada';
                const message = `Un usuario ha eliminado su suscripción al evento ${modifiedEvent.title}`;
                await sendAdminMail(name, surname, email, subject, message)
            }
        }
        return res.status(200).json({
            success: true,
            message: 'Inscription deleted',
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Función para procesar las solicitudes de inscripcion
// TODO: esta hay que ver si es útil o la eliminamos
export const editInscription = async (req, res) => {
    const { inscriptionId } = req.params;
    const { _id } = req.user;
    // ? añadir compartir recursos???
    const { inPersonApplication, premiumApplication } = req.body;
    if (!_id || !inscriptionId) {
        return res.status(404).json({
            success: false,
            message: 'Invalid request or not authorized',
        });
    }

    try {
        const user = await User.findById(_id);
        if (!user || !user.isBoss) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const inscription = await Inscription.findById(inscriptionId);
        if (!inscription) {
            return res.status(404).json({
                success: false,
                message: 'Inscription not found',
            });
        }

        const { eventId, userId } = inscription;
        if (inPersonApplication) {
            // añadir al array inperson del evento
            await Event.findByIdAndUpdate(
                eventId,
                {
                    $addToSet: { inPersonBookings: userId },
                });
        }
        if (premiumApplication) {
            // añadir al array premium del evento
            await Event.findByIdAndUpdate(
                eventId,
                {
                    $addToSet: { onlinePremiumBookings: userId },
                });
        }

        const updatedInscription = await Inscription.findByIdAndUpdate(
            inscriptionId,
            { proccessed: true },
            { new: true }
        );
        return res.status(200).json({
            success: true,
            message: 'Inscription processed',
            updatedInscription,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const getMyOwnInscriptions = async (req, res) => {
    const { _id } = req.user;
    if (!_id) {
        return res.status(404).json({
            success: false,
            message: 'Invalid request',
        });
    }

    try {
        const user = await User.findById(_id).lean();
        if (!user) return res.status(401)
            .json({
                success: false,
                message: 'Unauthorized.',
            });

        const myInscriptions = await Inscription.find({ userId: _id }).lean().populate({
            path: 'eventId',
            select: 'title startDate endDate address publicEventUrl premiumEventUrl',
        });

        const modifiedInscriptions = JSON.parse(JSON.stringify(myInscriptions))
        modifiedInscriptions.forEach(inscription => {
            if (!inscription.proccessed) inscription.eventId.premiumEventUrl = undefined;
        })

        return res.status(200)
            .json({
                success: true,
                myInscriptions: modifiedInscriptions,
            });
    } catch (error) {
        console.error(error.message);
        return res.status(500)
            .json({
                success: false,
                message: 'Error en getNextEventsAdmin.'
            });
    }

}

export const proccessInscription = async (req, res) => {
    // comprobacion de seguridad, solo boss
    // traer datos de inscripcion y parametros del body o del queryparam
    const { _id } = req.user;
    const {
        inPersonApplication,
        premiumApplication,
        shareResources,
        inscription
    } = req.body;
    const {
        eventId,
        userId,
        _id: inscriptionId
    } = inscription;

    if (!_id) {
        return res.status(401).json({
            success: false,
            message: 'Invalid request ',
        });
    }

    try {
        const user = await User.findById(_id);
        if (!user || !user.isBoss) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized.',
            });
        }
        // Obtener datos de la inscripcion
        const foundInscription = await Inscription.findById(inscriptionId)
        if (!foundInscription) {
            return res.status(404).json({
                success: false,
                message: 'Inscription not found',
            });
        }
        // comprobar plazas libres -- prioridad en persona
        // TODO: refactor mejor: availableSeats(eventId, inPersonApplication,premiumApplication)
        let type;
        if (premiumApplication) type = 'inPersonApplication';
        if (inPersonApplication) type = 'inPersonApplication';
        const isAvailable = await availableSeats(eventId, type)
        console.log({ isAvailable })
        if (!isAvailable) return res.status(422).json({
            success: false,
            message: 'No seats available for this event',
        });

        // colocar cada uno de las configuraciones en su sitio
        const promises = [];
        if (inPersonApplication) {
            promises.push(addUserToInPersonEvent(eventId, userId));
        } else if (premiumApplication) {
            promises.push(addUserToPremiumEvent(eventId, userId));
        }
        if (shareResources) {
            promises.push(setUserAsContributorInEvent(eventId, userId));
        }
        // Ejecutar todas las promesas en paralelo
        await Promise.all(promises);

        // poner proccessed en true
        await Inscription.updateOne({ _id: inscriptionId }, { proccessed: true });

        return res.status(200)
            .json({
                success: true,
            });

    } catch (error) {
        console.error(error.message);
        return res.status(500)
            .json({
                success: false,
                message: 'Error procesando la inscripción.'
            });
    }
}