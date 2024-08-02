import User from '../models/user.model.js';
import Edusource from '../models/edusource.model.js';

export async function likeService(resourceId, userId) {
    try {
        const user = await User.findById(userId)
            .populate('edusources')
            .populate({
                path: 'valorations',
                populate: {
                    path: 'senderId',
                    model: 'User',
                },
            });
        const resource = await Edusource.findById(resourceId)
            .populate('creatorId')
            .populate({
                path: 'valorations',
                populate: {
                    path: 'senderId',
                    model: 'User',
                },
            });
        if (!user || !resource) throw new Error('No se encuentra usuario o recurso')

        if (user.favorites.includes(resourceId)) {
            user.favorites = user.favorites.filter((itemId) => resourceId != itemId)
            resource.likes = resource.likes.filter((id) => userId != id)
        } else {
            user.favorites.push(resourceId)
            resource.likes.push(userId)
        }

        await user.save()
        await resource.save()

        return {
            user,
            resource
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error en likeService')
    }
}