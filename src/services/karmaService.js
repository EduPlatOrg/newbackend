import User from '../models/user.model.js';

export async function addKarmaService(id, karma) {
    try {
        const userFound = await User.findByIdAndUpdate(id,
            { $inc: { karma: karma } }
            , { new: true });
        if (!userFound) {
            return {
                success: false,
                error: 'User not found'
            }
        }
        return {
            success: true,
            user: userFound
        }
    } catch (error) {
        return {
            success: false,
            error
        }
    }
}