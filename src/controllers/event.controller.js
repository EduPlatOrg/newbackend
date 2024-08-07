import Event from '../models/event.model.js'
import User from '../models/user.model.js';

export const getEventById = async (req, res) => {
    const { id } = req.params
    if (!id) return res.status(404).json({
        success: false, message: 'Invalid request'
    });

    try {
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({
            success: false,
            message: 'Event not found!'
        })

        res.status(200).json({
            success: true,
            event
        })

    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });
    }
}

export const getAllEvents = async (req, res) => {
    const pastEvents = [];
    const nextEvents = [];
    try {
        const events = await Event.find({})
        events.forEach((event) => {
            if (event.endDate > Date.now()) nextEvents.push(event);
            else pastEvents.push(event);
        })
        return res.status(200).json({
            success: true,
            pastEvents,
            nextEvents
        })
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });
    }
}

export const newEvent = async (req, res) => {
    const body = req.body;

    // const {
    //     title, description, youtubeUrl, mainImage, pdfDocument, images, online, inPerson, onlinePremiumPlaces, onlineFreePlaces, inPersonPlaces, address, streetaddress, city, state, postalCode, country, price, premiumEventUrl, publicEventUrl, startDate, endDate
    // } = req.body;

    const { _id } = req.user;
    if (!_id) return res.status(400).json({
        success: false,
        message: 'Invalid token.'
    })
    try {
        const user = await User.findById(_id);
        if (!user || !user.isBoss) return res.status(401).json({
            success: false,
            message: 'Unauthorized.'
        })

        const event = new Event({
            ...body,
            creatorId: _id,
        });
        const createdEvent = await event.save();

        res.status(200).json({
            success: true,
            message: 'Evento creado correctamente',
            event: createdEvent.title
        })
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Error creando el evento',
            error: error.errmsg
        });
    }
}

export const editEvent = async (req, res) => {
    const { id } = req.params
    const updatedFields = req.body;

    if (!id) return res.status(404).json({
        success: false, message: 'Invalid request'
    });

    const { _id } = req.user;
    if (!_id) return res.status(400).json({
        success: false,
        message: 'Invalid token.'
    })

    try {
        const user = await User.findById(_id);
        if (!user || !user.isBoss) return res.status(401).json({
            success: false,
            message: 'Unauthorized.'
        })
        await Event.findByIdAndUpdate(id, {
            ...updatedFields,
            editedBy: _id,
        }, { new: true });

        res.status(200).json({
            success: true,
            message: 'Evento editado correctamente',
            // ...updatedFields
        })
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Error editando el evento',
            error: error.errmsg
        });
    }
}
export const deleteEvent = async (req, res) => {
    const { id } = req.params
    if (!id) return res.status(404).json({
        success: false, message: 'Invalid request'
    });

    const { _id } = req.user;
    if (!_id) return res.status(400).json({
        success: false,
        message: 'Invalid token.'
    })

    try {
        const user = await User.findById(_id);
        if (!user || !user.isBoss) return res.status(401).json({
            success: false,
            message: 'Unauthorized.'
        })
        await Event.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Evento eliminado correctamente',
        })
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Error eliminando el evento',
            error: error.errmsg
        });
    }
}

export const getNextEventsAdmin = async (req, res) => {
    // TODO: falta hacer la cuenta de inscripciones en cada evento


    try {
        // const events = await Event.find({
        //     endDate: { $gt: Date.now() },
        // })
        //     .populate('inPersonBookings')
        //     .populate('onlinePremiumBookings')

        const events = await Event.aggregate([
            { $match: { endDate: { $gt: new Date() } } },
            {
                $lookup: {
                    from: "inscripciones",
                    localField: "inPersonBookings",
                    foreignField: "_id",
                    as: "inPersonBookingsPopulated"
                }
            },
            {
                $addFields: {
                    inPersonBookingsFiltered: {
                        $filter: {
                            input: "$inPersonBookingsPopulated",
                            as: "booking",
                            cond: { $eq: ["$$booking.processed", false] }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "inscripciones",
                    localField: "onlinePremiumBookings",
                    foreignField: "_id",
                    as: "onlinePremiumBookingsPopulated"
                }
            },
            {
                $addFields: {
                    onlinePremiumBookingsFiltered: {
                        $filter: {
                            input: "$onlinePremiumBookingsPopulated",
                            as: "booking",
                            cond: { $eq: ["$$booking.processed", false] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    inPersonBookingsCount: { $size: "$inPersonBookingsFiltered" },
                    onlinePremiumBookingsCount: { $size: "$onlinePremiumBookingsFiltered" },
                    onlineFreeBookingsCount: { $size: "$onlineFreeBookings" },
                    totalInscripciones: {
                        $add: [
                            { $ifNull: ["$inPersonBookingsCount", 0] },
                            { $ifNull: ["$onlinePremiumBookingsCount", 0] },
                            { $ifNull: ["$onlineFreeBookingsCount", 0] }
                        ]
                    }
                }
            },
            {
                $project: {
                    allFields: "$$ROOT",  // Proyecta todos los campos originales del documento
                    inPersonBookingsCount: 1,
                    onlinePremiumBookingsCount: 1,
                    onlineFreeBookingsCount: 1,
                    totalInscripciones: 1
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$allFields", {
                            inPersonBookingsCount: "$inPersonBookingsCount",
                            onlinePremiumBookingsCount: "$onlinePremiumBookingsCount",
                            onlineFreeBookingsCount: "$onlineFreeBookingsCount",
                            totalInscripciones: "$totalInscripciones"
                        }]
                    }
                }
            }
        ]);
        
        

        





        return res.json({
            events,
        })

    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Error en getNextEventsAdmin.' });

    }
}

export const getEmailsFromEventByEventId = async (req, res) => {
    const { eventId } = req.params;
    const { _id } = req.user;
    if (!_id || !eventId) {
        return res.status(404).json({
            success: false,
            message: 'Invalid request or unauthorized',
        });
    }

    try {
        const emails = await Event.findById(eventId).populate('')
        const event = await Event.findById(eventId, { _id: 0 }) // Excluimos todos los campos del evento
            .populate({
                path: 'onlineFreeBookings',
                select: 'username email '
            })
            .populate({
                path: 'onlinePremiumBookings',
                select: 'username email'
            })
            .populate({
                path: 'inPersonBookings',
                select: 'username email'
            })
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });

    }
}