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
