import Inscription from '../../models/inscription.model.js';
import Event from '../../models/event.model.js';

export async function getUnprocessedInscriptions(eventId) {
  try {
    const inscriptions = await Inscription.find({
      eventId,
      $and: {
        proccessed: false,
      },

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
  // console.log('addUser', { eventId, userId })
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