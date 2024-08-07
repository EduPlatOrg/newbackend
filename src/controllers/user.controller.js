import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateTokenAccess } from '../libs/jsonwebtoken.js';

import User from '../models/user.model.js';
import Valoration from '../models/valorations.model.js';
import {
  sendEmailVerification,
  sendInfoMail,
  sendNewPassword,
} from '../services/mailing.js';

import { randomPinNumber } from '../utils/randomGenerator.js';
import { addKarmaService } from '../services/karmaService.js';
import { domains } from 'googleapis/build/src/apis/domains/index.js';

export const registerUser = async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;

  try {
    const userFound = await User.findOne({ email: email });
    if (userFound) {
      return res.status(400).send('User already exists');
    }
    const salt = await bcrypt.hash(password, 10);
    const user = new User({
      firstname,
      lastname,
      username,
      email,
      password: salt,
      isVerified: false,
      favorites: [],
      emails: [{ emailUrl: email, emailDescription: 'Home' }],
      phones: [{ phoneNumber: '', phoneDescription: '' }],
      social: [{ media: '', user: '' }],
      address: {
        streetaddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    });
    const newUser = await user.save();
    console.log(newUser, '<--- newUser backend controller registration');
    const tokenAccess = await generateTokenAccess({ _id: newUser._id });

    // Enviar correo de verificacion de email --> api gmail
    sendEmailVerification(email, tokenAccess);
    res.status(200).json({
      newUser,
      success: true,
      message: 'New user created. Check your email for a verification link',
    });
  } catch (error) {
    console.log(error, '<--- ERROR');
    res.status(500).json({
      success: false,
      message: 'Something went wrong on our end.Please try again!',
    });
  }
};

export const veryfyUsername = async (req, res) => {
  const { username } = req.query;

  if (!username || username.length < 3) return;
  try {
    // Buscar un usuario por username
    const userExists = await User.findOne({ username: username });

    if (userExists) {
      return res.status(200).json({ success: true, message: 'User exists.' });
    } else {
      return res
        .status(404)
        .json({ success: false, message: 'User does not exist.' });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
};

export const verifyEmail = async (req, res) => {
  const { email } = req.query;

  if (!email || email.length < 3) return;
  try {
    // Buscar un usuario por username
    const userExists = await User.findOne({ username: email });

    if (userExists) {
      return res.status(200).json({ success: true, message: 'User exists.' });
    } else {
      return res
        .status(404)
        .json({ success: false, message: 'User does not exist.' });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
};

export const verifyUser = async (req, res) => {
  // console.log(req.params.token, '<--- req.params.token');
  try {
    const decodToken = await jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );
    console.log(decodToken, '<--- decodToken');
    if (!decodToken || !decodToken._id) {
      return res.status(400).send('Token is invalid');
    }
    const userFound = await User.findByIdAndUpdate(
      decodToken._id,
      {
        isVerified: true,
      },
      { new: true }
    );
    // console.log(userFound, '<--- userFound ***************');
    if (!userFound) {
      return res.status(400).json({ msg: 'User not found' });
    }
    res
      .status(200)
      .json({ userFound, message: 'User verified', success: true });
  } catch (error) {
    console.error(error, '<--- ERROR');
  }
};

export const logInUser = async (req, res) => {
  const { email, password, isLogged } = req.body;
  const cookiesDomain = process.env.DOMAIN;
  try {
    const userFound = await User.findOneAndUpdate(
      { email },
      { isLogged },
      { new: true }
    ).populate('edusources');

    if (!userFound) {
      //TODO: VALIDAR MEJOR LOS ERRORES

      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }
    if (!userFound.isVerified) {
      return res.status(400).send('User not verified');
    }
    await User.findByIdAndUpdate(userFound._id, { lastLogin: Date.now() });

    const tokenAccess = await generateTokenAccess({
      _id: userFound._id,
      firstname: userFound.firstname,
      lastname: userFound.lastname,
      username: userFound.username,
      email: userFound.email,
      picture: userFound.avatar,
      isLogged: userFound.isLogged,
    });
    res.cookie('token', tokenAccess, {
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      domain: cookiesDomain,
    });
    res.status(200).json(userFound);
  } catch (error) {
    console.error(error, '<--- ERROR');
  }
};

export const logInWithToken = async (req, res) => {
  const { _id } = req.user;
  console.log(req.user, '<--- req.user');
  try {
    const userFound = await User.findByIdAndUpdate(_id, {
      lastLogin: Date.now(),
    });
    if (!userFound) {
      return res.status(400).send('User not found');
    }
    res.status(200).json(userFound);
  } catch (error) {
    console.error(error, '[LOG IN WITH TOKEN ERROR]');
    res.status(400).send('token invalido');
  }
};

export const logOut = async (req, res) => {
  const { _id } = req.user;
  res.clearCookie('token');

  try {
    const { username } = await User.findOneAndUpdate(
      { _id },
      { isLogged: false },
      { new: true }
    );
    res.status(200).json({ username, message: 'Logged Out', success: true });
  } catch (error) {
    console.error(error, '<--- ERROR');
    res.status(400).json({ message: 'Error en LogOut' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || email.length < 3)
      return res
        .status(404)
        .json({ success: false, message: 'Email not found.' });

    const newPin = randomPinNumber(10);
    const salt = await bcrypt.hash(newPin, 10);
    await User.findOneAndUpdate({ email }, { password: salt }, { new: true });
    sendNewPassword(email, newPin);

    return res.status(200).json({
      success: true,
      message: 'Recovery mail sent, please check your inbox.',
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
};

export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { _id } = req.user;

  if (!password || password.length < 8)
    return res
      .status(404)
      .json({ success: false, message: 'Invalid password' });

  if (!_id)
    return res.status(404).json({ success: false, message: 'Invalid user' });

  try {
    const salt = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate({ _id }, { password: salt }, { new: true });
    return res
      .status(200)
      .json({ success: true, message: 'Password successfully updated.' });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
};

export const getAllUsers = async (req, res) => {
  const { _id } = req.user;
  if (!_id)
    return res.status(404).json({ success: false, message: 'Invalid user' });

  try {
    const allUsers = await User.find();
    return res.status(200).json({ success: true, _id, allUsers });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
};

export const editUser = async (req, res) => {
  const { _id } = req.user;
  const idParam = req.params.idParam;
  const updatedFields = req.body;

  if (!_id === idParam)
    return res.status(404).json({ success: false, message: 'Invalid user' });

  try {
    const { _doc } = await User.findById(_id);
    const updatedUser = { ..._doc, ...updatedFields };
    const { password, ...secureUpdate } = updatedUser;
    console.log(secureUpdate, '<--- secureUpdate');
    const result = await User.findByIdAndUpdate(_id, secureUpdate, {
      new: true,
    });
    console.log(result, '<--- result');
    return res.status(200).json({
      success: true,
      message: 'User successfully updated.',
      ...updatedFields,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
};

export const getUserById = async (req, res) => {
  const _id = req.params.id;

  if (!_id) {
    return res.status(404).json({ success: false, message: 'Invalid user' });
  }

  try {
    const user = await User.findById(_id)
      .populate('edusources')
      .populate({
        path: 'valorations',
        populate: {
          path: 'senderId',
          model: 'User',
        },
      });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
};

export const banUserById = async (req, res) => {
  const { isVerified } = req.body;

  const { id } = req.params;
  if (!id)
    return res.status(404).json({
      success: false,
      message: 'Invalid request',
    });

  const { _id } = req.user;
  if (!_id)
    return res.status(400).json({
      success: false,
      message: 'Invalid token.',
    });

  try {
    const user = await User.findById(_id);
    if (!user || !user.isBoss)
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });

    // aqui se banea o desbanea
    const bannedUser = await User.findByIdAndUpdate(
      id,
      { isVerified },
      {
        new: true,
      }
    );
    if (!bannedUser)
      return res.json({
        success: false,
        message: 'User not found',
      });
    // aqui se informa
    const { firstname, lastname, email } = bannedUser;
    let subject, message;
    if (isVerified) {
      subject = 'Tu cuenta ha sido reactivada';
      message =
        'Se ha resuelto la incidencia en tu cuenta, puedes volver a utilizar la plataforma. Muchas gracias.';
    } else {
      subject = 'Hay algún problema con tu cuenta Eduplat';
      message =
        'Hemos detectado alguna anomalía en tu cuenta y ha sido desactivada, por favor contacta con los administradores para solucionar el problema';
    }

    await sendInfoMail(firstname, lastname, email, subject, message);

    return res.json({
      succes: true,
      bannedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: 'Error al banear',
      error: error.errmsg,
    });
  }
};

export const addKarma = async (req, res) => {
  const { id, karma } = req.body;
  if (!id || !karma)
    return res.status(404).json({
      success: false,
      message: 'Invalid request',
    });

  try {
    const result = await addKarmaService(id, karma);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: 'Error en la adición de karma',
      error: error.errmsg,
    });
  }
};

export const getOwnComments = async (req, res) => {
  const { _id } = req.user;

  if (!_id)
    return res.status(404).json({
      success: false,
      message: 'Invalid request',
    });

  try {
    const valorations = await Valoration.find({ userId: _id, accepted: false })
      .populate('senderId')
      .sort({ date: -1 });

    if (!valorations) {
      return res.send([]);
    }
    return res.send(valorations);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: 'Error obteniendo valoraciones',
      error: error.errmsg,
    });
  }
};
