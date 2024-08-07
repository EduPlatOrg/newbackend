//  TODO: Implementar métodos: getInscriptionsByEventId, getInscriptionsByUserId, newInscription, deleteInscription, editInscription

import bcrypt from 'bcryptjs';
import { generateTokenAccess } from '../libs/jsonwebtoken.js';
import { sendEmailVerification, sendNewPassword } from '../services/mailing.js';
import { randomPinNumber } from '../utils/randomGenerator.js';
import Event from '../models/event.model.js';
import Inscription from '../models/inscription.model.js';
import User from '../models/user.model.js';
import { getUnprocessedInscriptions } from '../services/incription/inscription.services.js';
import mongoose from 'mongoose';

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
    let isAlrreadyInscribed = false;
    if (user.inscriptions.length > 0) {
      const idExist = user.inscriptions.some((insc) =>
        insc.eventId.equals(checkId)
      );
      isAlrreadyInscribed = idExist;
      console.log('isAlrreadyInscribed', isAlrreadyInscribed);
    }
    if (isAlrreadyInscribed) {
      return res.status(200).json({
        success: false,
        message: 'User already inscribed in this event',
        allreadyInscribed: isAlrreadyInscribed,
      });
    }

    const inscription = new Inscription({
      ...req.body,
      userId: user._id,
      inPersonApplication: inPlace,
      premiumApplication: premiumOnline,
    });

    // TODO: añadir inscripcion al usuario
    const userWithInscription = await User.findByIdAndUpdate(
      user._id,
      {
        $push: { inscriptions: inscription._id },
      },
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
      {
        $push: { onlineFreeBookings: userWithInscription._id },
      },
      { new: true }
    );

    if (!eventWithUserInscription) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { inscriptions: inscription._id },
      });
      return res.status(404).json({
        success: false,
        message: 'Event not found!',
      });
    }

    await inscription.save();

    //await sendInscriptionNotificationEmail(inscription, eventWithUserInscription, userWithInscription);
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
};

// export const getEmailsFromEventByEventId = async....

export const deleteInscription = async (req, res) => {
  // autenticar usuario o admin
  // buscar inscripcion en usuario

  // quitar id de inscripcion en array de eventos

  // comprobar si esta procesada. si no, eliminar solo de freeonline
  // buscar en todas las inscripciones del evento y eliminar
  // borrar inscripcion

  return res.status(404).json({
    success: false,
    message: 'Method not implemented',
    body: req.body,
  });
};
export const editInscription = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;

  const { inPersonApplication, premiumApplication, shareResources } = req.body;
  if (!_id || !id) {
    return res.status(404).json({
      success: false,
      message: 'Invalid request or not authorized',
    });
  }

  // Mirar en el _id si es el mismo que el de la inscripcion o si es admin
  try {
    const user = await User.findById(_id);
    if (!user || !user.isBoss) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    const inscription = await Inscription.findById(id);

    if (!inscription) {
      return res.status(404).json({
        success: false,
        message: 'Inscription not found',
      });
    }

    const updatedInscription = await Inscription.findByIdAndUpdate(
      id,
      { proccessed: true },
      { new: true }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }

  // autenticar SOLO admin

  // solo si no esta procesada
};
