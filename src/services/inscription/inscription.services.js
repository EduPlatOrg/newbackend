import Inscription from '../../models/inscription.model.js';

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
  


  
}