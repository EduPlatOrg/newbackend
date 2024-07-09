import User from '../models/user.model.js';
import Edusource from '../models/edusource.model.js';
import { queryFormatter } from '../utils/queryFormatter.js';

export const getEdusourceById = async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(404).json({
            success: false,
            message: 'Invalid request',
        });

    try {
        const edusource = await Edusource.findById(id);
        if (!edusource)
            return res.status(404).json({
                success: false,
                message: 'Edusource not found!',
            });
        res.status(200).json({
            success: true,
            edusource,
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });
    }
};

export const getEdusources = async (req, res) => {
    // TODO: tenemos que definir los niveles que habrá, para ajustar bien los filtros
    // TODO: tenemos que definir la base de valoraciones, sobre 10, sobre 5, y los tipos de números que hay que poner en el modelo y en mongoDB

    // TODO: añadir la paginación

    const search = queryFormatter(req)
    
    try {
        const edusources = await Edusource.find(search)
        return res.status(200).json({
            success: true,
            edusources,
        })
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });
    }
}


// TODO: repasar lo siguiente:
// Buenas paso el modelo de lo que llegara para crear un nuevo recurso
// {
//   title: '¿Cómo se usa el microscopio?',
//   description:
//     'En este artículo aprenderás cómo usar el microscopio correctamente, una habilidad básica para poder sacarle todo el provecho a este instrumento y para mantenerlo en buen estado.',
//   youtubeUrl: 'https://www.youtube.com/watch?v=43bBiWFC__g',
//   externalLink: 'https://www.mundomicroscopio.com/wp-content/uploads/2019/09/como_usar_microscopio.jpg',
//   discipline: 'Microscopio, Biología',
//   subDicipline: 'Tecnicas',
//   language: 'Español',
//   media: 'Instagram',
//   user: 'https://www.instagram.com/bajo.elmicroscopio/',
//   licence: 'CC',
//   image: 'https://res.cloudinary.com/dk2uakyub/image/upload/v1719994040/como_usar_microscopio_oh91yf.jpg',
//   pdfDocument: 'https://res.cloudinary.com/dk2uakyub/image/upload/v1719994133/Microscopio_tqjjre.pdf',
//   creatorId: '66756960c387d68772bf9063'
// }

// a esto en el backend hay que agregarle la fecha de creación, que será justo en el momento en el que se grabe en la BD, y hay que crear un link al recurso que será la url del front,
// process.env.BASE_FRONTEND_URL + ‘/recursos-educativos/‘ + el id del recurso subido en ese momento, esto hay que guardarlo primero y con el id que te devuelve hacer un update con el link

export const newEdusource = async (req, res) => {
    const body = req.body;
    const { _id } = req.user;

    try {
        const user = await User.findById(_id);
        if (!user) return res.status(401).json({
            success: false,
            message: 'Unauthorized.'
        })

        const edusource = new Edusource({
            ...body,
            creatorId: _id,
        });
        const createdEdusource = await edusource.save();
        // añadir id de recurso a ususario.edusources
        user.edusources.push(createdEdusource._id)
        await user.save()

        // link del recurso
        createdEdusource.link = `${process.env.BASE_FRONTEND_URL}/recursos-educativos/${createdEdusource._id}`;
        await createdEdusource.save();

        res.status(200).json({
            success: true,
            message: 'Edusource creado correctamente',
            edusource: createdEdusource
        })
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Error creando Edusource',
            error
        });
    }
}

export const editEdusource = async (req, res) => {
    const updatedFields = req.body;
    const { _id } = req.user;
    const { id } = req.params;

    if (!id)
        return res.status(404).json({
            success: false,
            message: 'Invalid request',
        });
    if (!_id)
        return res.status(400).json({
            success: false,
            message: 'Invalid token.',
        });

    try {
        // confirmación: solo creador o administrador pueden editar
        const user = await User.findById(_id);
        if (!user)
            return res.status(401).json({
                success: false,
                message: 'Unauthorized.',
            });

        const edusource = await Edusource.findById(id);
        if (user._id.toString() !== edusource.creatorId.toString() && !user.isBoss)
            return res.status(401).json({
                success: false,
                message: 'Unauthorized.',
            });
        // modificación del recurso
        const modifiedEdusource = await Edusource.findByIdAndUpdate(
            id,
            {
                ...updatedFields,
            },
            { new: true }
        );
        res.status(200).json({
            success: true,
            message: 'Edusource editado correctamente',
            modifiedEdusource,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Error editando Edusource',
            error,
        });
    }
};

export const deleteEdusource = async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;

    if (!id)
        return res.status(404).json({
            success: false,
            message: 'Invalid request',
        });
    if (!_id)
        return res.status(400).json({
            success: false,
            message: 'Invalid token.',
        });



    try {
        // confirmación: solo creador o administrador pueden editar
        const user = await User.findById(_id);
        if (!user) return res.status(401).json({
            success: false,
            message: 'Unauthorized.'
        })

        const edusource = await Edusource.findById(id)
        if (user._id.toString() !== edusource.creatorId.toString() && !user.isBoss) return res.status(401).json({
            success: false,
            message: 'Unauthorized.'
        })

        const index = user.edusources.indexOf(id)

        if (!index) {
            return res.status(401).json({
                success: false,
                message: 'Recurso no encontrado.'
            })
        }

        // evitar errores inesperados

        await Edusource.findByIdAndDelete(id);
        // eliminar id de recurso en usuario.edusources
        user.edusources.splice(index, 1);
        await user.save()


        res.status(200).json({
            success: true,
            message: 'Edusource eliminado correctamente',
        })

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Error eliminando Edusource',
            error
        });
    }
}