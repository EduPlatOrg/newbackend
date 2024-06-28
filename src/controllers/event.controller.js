import Event from '../models/event.model.js'
import User from '../models/user.model.js';

export const getEventById = async (req, res) => {
    return res.json({
        success: true,
        params: req.params,
        body: req.body,
    })

    const { id } = req.params.id
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


export const getNextEvents = (req, res) => {
    return res.json({ ok: true, message: 'getNextEvents' })
}



export const newEvent = async (req, res) => {
    const body = req.body;

    // const {
    //     title, description, youtubeUrl, mainImage, pdfDocument, images, online, inPerson, onlinePremiumPlaces, onlineFreePlaces, inPersonPlaces, address, streetaddress, city, state, postalCode, country, price, premiumEventUrl, publicEventUrl, startDate, endDate
    // } = req.body;

    const _id = req.user;
    if (!_id) return res.status(400).json({
        success: false,
        message: 'Invalid request.'
    })
    const user = await User.findById(_id);
    if (!user || !user.isBoss) return res.status(401).json({
        success: false,
        message: 'Unauthorized.'
    })

    try {
        const event = new Event({
            ...body,
            creator: _id,
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
export const editEvent = (req, res) => {
    return res.json({ ok: true })
}
export const deleteEvent = (req, res) => {
    return res.json({ ok: true })
}
