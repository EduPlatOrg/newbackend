import Inscription from '../../models/inscription.model.js';
import Event from '../../models/event.model.js';
import User from '../../models/user.model.js';

import { sendAdminMail } from '../mailing.js';

export async function getUnprocessedInscriptions(eventId) {
  try {
    const inscriptions = await Inscription.find({
      eventId,

      proccessed: false,

      $or: [
        { inPersonApplication: true },
        { premiumApplication: true },
        { shareResources: true },
      ],
    });
    return inscriptions;
  } catch (error) {
    console.error('Error fetching inscriptions:', error);
    throw error;
  }
}

export async function addUserToInPersonEvent(eventId, userId) {
  try {
    await Event.updateOne(
      { _id: eventId },
      { $addToSet: { inPersonBookings: userId } }
    );
  } catch (error) {
    console.error('Error adding user to event:', error);
    throw error;
  }
}

export async function addUserToPremiumEvent(eventId, userId) {
  try {
    await Event.updateOne(
      { _id: eventId },
      { $addToSet: { onlinePremiumBookings: userId } }
    );
  } catch (error) {
    console.error('Error adding user to event:', error);
    throw error;
  }
}

export async function setUserAsContributorInEvent(eventId, userId) {
  try {
    await Event.updateOne(
      { _id: eventId },
      { $addToSet: { resourceContributors: userId } }
    );
  } catch (error) {
    console.error('Error adding user to event:', error);
    throw error;
  }
}

export async function deleteInscriptionService(inscriptionId) {
  try {
    const deletedInscription = await Inscription.findByIdAndDelete(
      inscriptionId,
      isBoss
    );
    if (!deletedInscription) {
      // esto no debe darse nunca porque ya se ha comprobado en el controller
      throw new Error('Inscription not found');
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
      await Event.updateOne(
        { _id: eventId },
        {
          $pull: {
            onlinePremiumBookings: userId,
            inPersonBookings: userId,
          },
        }
      );
      // notificar en caso de que no lo haya eliminado un Boss.
      if (!isBoss) {
        const { name, surname, email } = modifiedUser;
        const subject = 'Inscripción eliminada';
        const message = `Un usuario ha eliminado su suscripción al evento ${modifiedEvent.title}`;
        await sendAdminMail(name, surname, email, subject, message);
      }
    }
  } catch (error) {
    console.error('Error deleting inscription:', error.message);
    throw error;
  }
}
