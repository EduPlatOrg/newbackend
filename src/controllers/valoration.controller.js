import User from '../models/user.model.js';
import Edusource from '../models/edusource.model.js';
import Valoration from '../models/valorations.model.js';

export const asignNewValoration = async (req, res) => {
  const { _id } = req.user;
  const { rating, comment, resourceId } = req.body;
  const newValoration = {
    senderId: _id,
    rating,
    comment,
    resourceId,
    accepted: true,
  };

  if (!rating || !comment || !resourceId)
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
    });
  if (!_id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  try {
    const valoration = new Valoration(newValoration);
    const savedValoration = await valoration.save();

    if (!savedValoration) {
      return res.status(400).json({
        success: false,
        message: 'Error saving valoration',
      });
    }
    const resourceValorated = await Edusource.findByIdAndUpdate(
      { _id: resourceId },
      {
        $push: { valorations: savedValoration._id },
      },
      { new: true }
    ).populate('valorations');
    console.log('resourceValorated', resourceValorated);
    const valorationLength = resourceValorated.valorations.length;
    const valorationRating = resourceValorated.valorations.reduce(
      (acc, val) => acc + val.rating,
      0
    );
    const newAverage = valorationRating / valorationLength;
    console.log({ newAverage, valorationLength, valorationRating });
    const resourceValoratedWithAverage = await Edusource.findByIdAndUpdate(
      { _id: resourceId },
      {
        valorationsAverage: {
          votes: valorationLength,
          average: newAverage,
        },
      },
      { new: true }
    )
      .populate('creatorId')
      .populate({
        path: 'valorations', // Primero, populamos las valoraciones
        populate: {
          path: 'senderId', // Luego, dentro de cada valoration, populamos senderId
          model: 'User', // Asumiendo que senderId hace referencia a un modelo 'User'
        },
      });
    console.log('resourceValoratedWithAverage', resourceValoratedWithAverage);
    if (!resourceValorated)
      return res.status(400).json({
        success: false,
        message: 'Error saving valoration',
      });

    res.status(200).json({
      success: true,
      message: 'Valoration assigned successfully',
      resourceValoratedWithAverage,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Error assigning valoration',
      error,
    });
  }
};
