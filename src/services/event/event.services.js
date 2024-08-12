import Event from '../../models/event.model.js';

export async function nextEventsPopulatedNotProccessed() {
    try {
        const events = await Event.aggregate([
            // 1. Filtrar eventos futuros
            // Solo seleccionamos eventos cuya fecha de finalización es mayor que la fecha actual
            {
                $match: {
                    endDate: { $gt: new Date() }
                }
            },

            // 2. Lookup para popular onlinePremiumBookings e inPersonBookings con usuarios
            // Este paso realiza una búsqueda en la colección de usuarios para cada booking
            // El resultado se almacena en los campos 'onlinePremiumBookingsPopulated' e 'inPersonBookingsPopulated'
            {
                $lookup: {
                    from: 'users', // Nombre de la colección de usuarios
                    localField: 'onlinePremiumBookings', // Campo en la colección de eventos que contiene IDs de usuarios
                    foreignField: '_id', // Campo en la colección de usuarios que coincide con 'localField'
                    as: 'onlinePremiumBookingsPopulated' // Nombre del campo en el resultado donde se almacenan los datos poblados
                }
            },
            {
                $lookup: {
                    from: 'users', // Nombre de la colección de usuarios
                    localField: 'inPersonBookings', // Campo en la colección de eventos que contiene IDs de usuarios
                    foreignField: '_id', // Campo en la colección de usuarios que coincide con 'localField'
                    as: 'inPersonBookingsPopulated' // Nombre del campo en el resultado donde se almacenan los datos poblados
                }
            },

            // 3. Lookup para inscripciones no procesadas
            // Primero para inscripciones de tipo onlinePremium
            {
                $lookup: {
                    from: 'inscriptions', // Nombre de la colección de inscripciones
                    let: {
                        userIds: '$onlinePremiumBookingsPopulated._id', // IDs de usuarios de las reservas premium online
                        eventId: '$_id' // ID del evento actual
                    },
                    pipeline: [
                        // Filtrar inscripciones que están asociadas a los usuarios y al evento actual
                        // Solo se seleccionan inscripciones que no han sido procesadas
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$userId', '$$userIds'] }, // Inscripciones de usuarios en 'userIds'
                                        { $eq: ['$eventId', '$$eventId'] }, // Inscripciones para el evento actual
                                        { $eq: ['$proccessed', false] } // Solo inscripciones no procesadas
                                    ]
                                }
                            }
                        },
                        // Agrupar inscripciones por ID de usuario
                        {
                            $group: {
                                _id: '$userId', // Agrupar por ID de usuario
                                inscriptions: { $push: '$$ROOT' } // Crear un array de inscripciones para cada usuario
                            }
                        },
                        // Lookup para obtener detalles de usuario
                        {
                            $lookup: {
                                from: 'users', // Nombre de la colección de usuarios
                                localField: '_id', // ID de usuario de la agrupación anterior
                                foreignField: '_id', // Campo en la colección de usuarios que coincide con 'localField'
                                as: 'userDetails' // Nombre del campo en el resultado donde se almacenan los datos de usuario
                            }
                        },
                        // Asegurarse de que 'userDetails' sea un objeto único (no un array)
                        {
                            $addFields: {
                                userDetails: { $arrayElemAt: ['$userDetails', 0] } // Tomar el primer (y único) elemento del array
                            }
                        },
                        // Excluir el campo 'password' por razones de seguridad
                        {
                            $project: {
                                'userDetails.password': 0 // Excluir el campo 'password'
                            }
                        }
                    ],
                    as: 'onlinePremiumBookingsFiltered' // Nombre del campo en el resultado donde se almacenan las inscripciones filtradas
                }
            },

            // Segundo para inscripciones de tipo inPerson
            {
                $lookup: {
                    from: 'inscriptions', // Nombre de la colección de inscripciones
                    let: {
                        userIds: '$inPersonBookingsPopulated._id', // IDs de usuarios de las reservas inPerson
                        eventId: '$_id' // ID del evento actual
                    },
                    pipeline: [
                        // Filtrar inscripciones que están asociadas a los usuarios y al evento actual
                        // Solo se seleccionan inscripciones que no han sido procesadas
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$userId', '$$userIds'] }, // Inscripciones de usuarios en 'userIds'
                                        { $eq: ['$eventId', '$$eventId'] }, // Inscripciones para el evento actual
                                        { $eq: ['$proccessed', false] } // Solo inscripciones no procesadas
                                    ]
                                }
                            }
                        },
                        // Agrupar inscripciones por ID de usuario
                        {
                            $group: {
                                _id: '$userId', // Agrupar por ID de usuario
                                inscriptions: { $push: '$$ROOT' } // Crear un array de inscripciones para cada usuario
                            }
                        },
                        // Lookup para obtener detalles de usuario
                        {
                            $lookup: {
                                from: 'users', // Nombre de la colección de usuarios
                                localField: '_id', // ID de usuario de la agrupación anterior
                                foreignField: '_id', // Campo en la colección de usuarios que coincide con 'localField'
                                as: 'userDetails' // Nombre del campo en el resultado donde se almacenan los datos de usuario
                            }
                        },
                        // Asegurarse de que 'userDetails' sea un objeto único (no un array)
                        {
                            $addFields: {
                                userDetails: { $arrayElemAt: ['$userDetails', 0] } // Tomar el primer (y único) elemento del array
                            }
                        },
                        // Excluir el campo 'password' por razones de seguridad
                        {
                            $project: {
                                'userDetails.password': 0 // Excluir el campo 'password'
                            }
                        }
                    ],
                    as: 'inPersonBookingsFiltered' // Nombre del campo en el resultado donde se almacenan las inscripciones filtradas
                }
            },

            // 4. Contar inscripciones filtradas
            // Añadir campos que cuentan las inscripciones de cada tipo
            {
                $addFields: {
                    onlinePremiumBookingsCount: { $size: '$onlinePremiumBookingsFiltered' }, // Contar inscripciones premium online
                    inPersonBookingsCount: { $size: '$inPersonBookingsFiltered' }, // Contar inscripciones inPerson
                    onlineFreeBookingsCount: { $size: { $ifNull: ['$onlineFreeBookings', []] } } // Contar inscripciones gratuitas online
                }
            },

            // 5. Reordenar para poner cuentas antes de arrays filtrados
            // Ajustar la proyección final para que el orden de los campos sea el deseado
            {
                $project: {
                    _id: 1, // Incluir el campo ID del evento
                    onlinePremiumBookingsFiltered: 1, // Incluir inscripciones premium online filtradas
                    inPersonBookingsFiltered: 1, // Incluir inscripciones inPerson filtradas
                    onlinePremiumBookingsCount: 1, // Incluir el conteo de inscripciones premium online
                    inPersonBookingsCount: 1, // Incluir el conteo de inscripciones inPerson
                    onlineFreeBookingsCount: 1, // Incluir el conteo de inscripciones gratuitas online
                    onlinePremiumBookingsPopulated: 1, // Incluir los datos poblados de reservas premium online
                    inPersonBookingsPopulated: 1 // Incluir los datos poblados de reservas inPerson
                }
            }
        ]);

        return events
        
    } catch (error) {
        console.error(error);
        return new Error('Error en nextEventsPopulatedNotProccessed.')
    }
}