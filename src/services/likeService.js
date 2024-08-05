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
    if (!user || !resource) throw new Error('Usuario o recurso no encontrado');

    if (user.favorites.includes(resourceId.toString())) {
      user.favorites = user.favorites.filter(
        (itemId) => resourceId.toString() !== itemId.toString()
      );
      resource.likes = resource.likes.filter(
        (id) => userId.toString() !== id.toString()
      );
    } else {
      user.favorites.push(resourceId.toString());
      resource.likes.push(userId.toString());
    }

    await user.save();
    await resource.save();

    return {
      user,
      resource,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Error en el servicio de like');
  }
}
