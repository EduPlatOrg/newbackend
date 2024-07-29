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
    console.log('resourceValorated.valorations', resourceValorated.valorations);
    const valorationLength = resourceValorated.valorations.length;
    const valorationRating = resourceValorated.valorations.reduce(
      (acc, val) => acc + val.rating,
      0
    );
    const newAverage = valorationRating / valorationLength;

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

export const asignNewUserValoration = async (req, res) => {
  const { _id } = req.user;
  const { rating, comment, userId } = req.body;
  const newValoration = {
    senderId: _id,
    rating,
    comment,
    userId,
    accepted: false,
  };

  if (!rating || !comment || !userId)
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
    const userValorated = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: { valorations: savedValoration._id },
      },
      { new: true }
    ).populate('valorations');
    console.log('resourceValorated', userValorated);
    const valorationLength = userValorated.valorations.length;
    const valorationRating = userValorated.valorations.reduce(
      (acc, val) => acc + val.rating,
      0
    );
    const newAverage = valorationRating / valorationLength;

    const userValoratedWithAverage = await User.findByIdAndUpdate(
      { _id: userId },
      {
        valorationsAverage: {
          votes: valorationLength,
          average: newAverage,
        },
      },
      { new: true }
    )
      .populate('edusources')
      .populate({
        path: 'valorations',
        populate: {
          path: 'senderId',
          model: 'User',
        },
      });

    if (!userValorated)
      return res.status(400).json({
        success: false,
        message: 'Error saving valoration',
      });

    res.status(200).json({
      success: true,
      message: 'Valoration assigned successfully',
      userValoratedWithAverage,
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

export const removeValoration = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;

  if (!_id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  try {
    const valoration = await Valoration.findByIdAndDelete({
      _id: id,
    });
    if (!valoration) {
      return res.status(400).json({
        success: false,
        message: 'Error deleting valoration',
      });
    }
    if (valoration.resourceId) {
      const resourceValorated = await Edusource.findByIdAndUpdate(
        { _id: valoration.resourceId },
        {
          $pull: { valorations: valoration._id },
        },
        { new: true }
      ).populate('valorations');
      const valorationLength = resourceValorated.valorations.length;
      const valorationRating = resourceValorated.valorations.reduce(
        (acc, val) => acc + val.rating,
        0
      );
      let newAverage = 0;
      if (valorationLength > 0) {
        newAverage = valorationRating / valorationLength;
      }
      const resourceValoratedWithAverage = await Edusource.findByIdAndUpdate(
        { _id: valoration.resourceId },
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
      return res.status(200).json({
        success: true,
        message: 'Valoration deleted successfully',
        resource: resourceValoratedWithAverage,
      });
    }
    if (valoration.userId) {
      const user = await User.findByIdAndUpdate(
        { _id: valoration.userId },
        {
          $pull: { valorations: valoration._id },
        },
        { new: true }
      ).populate('valorations');
      const valorationLength = user.valorations.length;

      const valorationRating = user.valorations.reduce(
        (acc, val) => acc + val.rating,
        0
      );
      let newAverage = 0;
      if (valorationLength > 0) {
        newAverage = valorationRating / valorationLength;
      }

      const userWithAverage = await User.findByIdAndUpdate(
        { _id: valoration.userId },
        {
          valorationsAverage: {
            votes: valorationLength,
            average: newAverage,
          },
        },
        { new: true }
      )
        .populate('edusources')
        .populate({
          path: 'valorations', // Primero, populamos las valoraciones
          populate: {
            path: 'senderId', // Luego, dentro de cada valoration, populamos senderId
            model: 'User', // Asumiendo que senderId hace referencia a un modelo 'User'
          },
        });
      return res.status(200).json({
        success: true,
        message: 'Valoration deleted successfully',
        user: userWithAverage,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Error deleting valoration',
      error,
    });
  }
};

export const rejectValoration = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;

  if (!_id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  try {
    const valoration = await Valoration.findByIdAndUpdate(
      { _id: id },
      {
        rejected: true,
        accepted: false,
      },
      { new: true }
    );
    if (!valoration) {
      return res.status(400).json({
        success: false,
        message: 'Error rejecting valoration',
      });
    }
    if (valoration.resourceId) {
      const resourceValorated = await Edusource.findById({
        _id: valoration.resourceId,
      })
        .populate('creatorId')
        .populate({
          path: 'valorations',
          populate: {
            path: 'senderId',
            model: 'User',
          },
        });
      return res.status(200).json({
        success: true,
        message: 'Valoration rejected successfully',
        resource: resourceValorated,
      });
    }
    if (valoration.userId) {
      const user = await User.findById({
        _id: valoration.userId,
      })
        .populate('edusources')
        .populate({
          path: 'valorations', // Primero, populamos las valoraciones
          populate: {
            path: 'senderId', // Luego, dentro de cada valoration, populamos senderId
            model: 'User', // Asumiendo que senderId hace referencia a un modelo 'User'
          },
        });
      return res.status(200).json({
        success: true,
        message: 'Valoration rejected successfully',
        user,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Error rejecting valoration',
      error,
    });
  }
};

export const acceptValoration = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;

  if (!_id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  try {
    const valoration = await Valoration.findByIdAndUpdate(
      { _id: id },
      {
        accepted: true,
        rejected: false,
      },
      { new: true }
    );
    if (!valoration) {
      return res.status(400).json({
        success: false,
        message: 'Error rejecting valoration',
      });
    }
    if (valoration.resourceId) {
      const resourceValorated = await Edusource.findById({
        _id: valoration.resourceId,
      })
        .populate('creatorId')
        .populate({
          path: 'valorations',
          populate: {
            path: 'senderId',
            model: 'User',
          },
        });
      return res.status(200).json({
        success: true,
        message: 'Valoration rejected successfully',
        resource: resourceValorated,
      });
    }
    if (valoration.userId) {
      const user = await User.findById({
        _id: valoration.userId,
      })
        .populate('edusources')
        .populate({
          path: 'valorations', // Primero, populamos las valoraciones
          populate: {
            path: 'senderId', // Luego, dentro de cada valoration, populamos senderId
            model: 'User', // Asumiendo que senderId hace referencia a un modelo 'User'
          },
        });
      return res.status(200).json({
        success: true,
        message: 'Valoration rejected successfully',
        user,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Error rejecting valoration',
      error,
    });
  }
};
