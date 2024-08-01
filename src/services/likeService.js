import User from '../models/user.model.js';
import Edusource from '../models/edusource.model.js';

export async function likeService(resourceId, userId) {
    // Si el usuario ya ha dado like, se debe quitar el like."favorites": [],
    // Si el usuario no ha dado like, se debe añadir el like.
    // Se debe actualizar el estado del recurso con el nuevo like añadiendo el id del usuario. "likes": [],
    // Se debe añadir el id del recurso al array de favoritos del usuario.
    // Si ya estaba el id se debe quitar el id del recurso del array de favoritos del usuario y quitar el id del usuario del apartado likes del recurso.
    // La respuesta de la API debe devolver tanto el recurso actualizado como el usuario actualizado.


    // encontrar el id del recurso en el array de favoritos del usuario
    // y/o encontrar el id del usuario en el array de favoritos del recurso.
    const user = await User.findById(userId);
    const resource = await Edusource.findById(resourceId)
    if (!user || !resource) throw new Error('No se encuentra usuario o recurso')
    
    if (user.favorites?.includes(resourceID)) {
        // eliminar el recurso de favoritos

        // en el usuario
        



        // en el recurso





    } else {
        // añadir el recurso a favoritos
        
        // en el usuario



        // en el recurso
    }

    // guardar tanto el recurso como el usuario, y devolver los nuevos

    user.save()
    resource.save()
    








    return {
        user,
        resource
    }
}