import Event from '../../models/event.model.js';
import Inscription from '../../models/inscription.model.js';

export async function nextEventsPopulatedNotProccessed(eventId) {
  try {
    return await eventId ?
      getEventWithFilteredInscriptions(eventId) : getFutureEventsWithInscriptionCounts()
  } catch (error) {
    console.error(error)
    throw new Error("error del servicio de eventos");
  }
}

async function getFutureEventsWithInscriptionCounts() {
  const now = new Date();
  const futureEvents = await Event.find({ endDate: { $gt: now } }).lean();

  const eventsWithCounts = await Promise.all(
    futureEvents.map(async (event) => {
      const inscriptions = await Inscription.find({ eventId: event._id });

      const onlineFreeCount = inscriptions.filter(
        (inscription) =>
          !inscription.premiumApplication && !inscription.inPersonApplication
      ).length;
      const onlinePremiumCount = inscriptions.filter(
        (inscription) =>
          inscription.premiumApplication && !inscription.inPersonApplication
      ).length;
      const inPersonCount = inscriptions.filter(
        (inscription) => inscription.inPersonApplication
      ).length;

      return {
        onlineFreeBookingsCount: onlineFreeCount,
        onlinePremiumBookingsCount: onlinePremiumCount,
        inPersonBookingsCount: inPersonCount,
        event,
      };
    })
  );

  return eventsWithCounts;
}

async function getEventWithFilteredInscriptions(eventId) {
  const event = await Event.findById(eventId);
  const inscriptions = await Inscription.find({
    eventId: eventId,
    $or: [
      { premiumApplication: true },
      { inPersonApplication: true },
      { shareResources: true },
    ]
  }).populate('userId', '-password');

  const premiumInscriptions = inscriptions.filter(inscription => inscription.premiumApplication);
  const inPersonInscriptions = inscriptions.filter(inscription => inscription.inPersonApplication);
  const shareResources = inscriptions.filter(inscription => inscription.shareResources);

  return {
    event,
    premiumInscriptions,
    inPersonInscriptions,
    shareResources
  };
}