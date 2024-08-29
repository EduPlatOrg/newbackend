import Event from '../../models/event.model.js';
import Inscription from '../../models/inscription.model.js';

export async function nextEventsPopulatedNotProccessed(eventId) {
  try {
    return (await eventId)
      ? getEventWithFilteredInscriptions(eventId)
      : getFutureEventsWithInscriptionCounts();
  } catch (error) {
    console.error(error);
    throw new Error('error del servicio de eventos');
  }
}

async function getFutureEventsWithInscriptionCounts() {
  const now = new Date();
  const futureEvents = await Event.find({ endDate: { $gt: now } }).lean();

  const eventsWithCounts = await Promise.all(
    futureEvents.map(async (event) => {
      const inscriptions = await Inscription.find({ eventId: event._id });

      const onlineFreeBookingsCount = inscriptions.filter(
        (inscription) =>
          !inscription.premiumApplication && !inscription.inPersonApplication
      ).length;
      const onlinePremiumBookingsCount = inscriptions.filter(
        (inscription) =>
          inscription.premiumApplication && !inscription.inPersonApplication
      ).length;
      const inPersonBookingsCount = inscriptions.filter(
        (inscription) => inscription.inPersonApplication
      ).length;

      return {
        onlineFreeBookingsCount,
        onlinePremiumBookingsCount,
        inPersonBookingsCount,
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
    proccessed: false,
    $or: [
      { premiumApplication: true },
      { inPersonApplication: true },
      { shareResources: true },
    ],
  }).populate('userId', '-password');

  const premiumInscriptions = inscriptions.filter(
    (inscription) => inscription.premiumApplication
  );
  const inPersonInscriptions = inscriptions.filter(
    (inscription) => inscription.inPersonApplication
  );
  const shareResources = inscriptions.filter(
    (inscription) => inscription.shareResources
  );

  return {
    event,
    premiumInscriptions,
    inPersonInscriptions,
    shareResources,
  };
}

export async function availableSeats(
  eventId,
  inPersonApplication,
  premiumApplication
) {
  const inscription = await Event.findById(eventId)
    .select(
      'onlinePremiumPlaces inPersonPlaces onlinePremiumBookings inPersonBookings'
    )
    .lean();
  const {
    inPersonPlaces,
    inPersonBookings,
    onlinePremiumPlaces,
    onlinePremiumBookings,
  } = inscription;
  let availability = false;
  // comprobar que la inscripción es correcta
  if (inPersonApplication && premiumApplication)
    throw new Error('Cannot be in person and online premium at once');
  if (!inPersonApplication && !premiumApplication)
    throw new Error(
      'No option marked: inPersonApplication, premiumApplication'
    );

  if (inPersonApplication)
    availability = inPersonPlaces > inPersonBookings.length;
  else if (premiumApplication)
    availability = onlinePremiumPlaces > onlinePremiumBookings.length;

  return availability;
}
