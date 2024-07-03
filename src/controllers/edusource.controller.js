import User from '../models/user.model.js';
import Edusource from "../models/edusource.model.js";

export const getEdusourceById = async (req, res) => {
    const { id } = req.params
    if (!id) return res.status(404).json({
        success: false, message: 'Invalid request'
    });

    try {
        const edusource = await Edusource.findById(id);
        if (!edusource) return res.status(404).json({
            success: false,
            message: 'Edusource not found!'
        })
        res.status(200).json({
            success: true,
            edusource
        })
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });
    }
}

export const getEdusources = async (req, res) => {
    // TODO: meter query params y filtrar
    // si no hay queryparams devolver todo

    try {
        const edusources = await Edusource.find({})
        return res.status(200).json({
            success: true,
            edusources
        })
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });
    }
}

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
        res.status(200).json({
            success: true,
            message: 'Edusource creado correctamente',
            edusource: createdEdusource._id,
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
    const { id } = req.params

    if (!id) return res.status(404).json({
        success: false, message: 'Invalid request'
    });
    if (!_id) return res.status(400).json({
        success: false,
        message: 'Invalid token.'
    })

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
        // modificación del recurso
        const modifiedEdusource = await Edusource.findByIdAndUpdate(id, {
            ...updatedFields
        }, { new: true })
        res.status(200).json({
            success: true,
            message: 'Edusource editado correctamente',
            modifiedEdusource
        })
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Error editando Edusource',
            error
        });
    }
}

export const deleteEdusource = async (req, res) => {
    const { id } = req.params
    const { _id } = req.user;

    if (!id) return res.status(404).json({
        success: false, message: 'Invalid request'
    });
    if (!_id) return res.status(400).json({
        success: false,
        message: 'Invalid token.'
    })

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

        await Edusource.findByIdAndDelete(id);
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
