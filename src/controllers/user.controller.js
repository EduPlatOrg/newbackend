import bcrypt from 'bcryptjs';
import { generateTokenAccess } from '../libs/jsonwebtoken.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { sendEmailVerification, sendNewPassword } from '../services/mailing.js';
import { randomPinNumber } from '../utils/randomGenerator.js';

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

  try {
    const userFound = await User.findOneAndUpdate(
      { email },
      { isLogged },
      { new: true }
    );

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
      secure: true,
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
  const { newPassword } = req.body;
  const { _id } = req.user;

  if (!newPassword || newPassword.length < 8)
    return res
      .status(404)
      .json({ success: false, message: 'Invalid password' });

  if (!_id)
    return res.status(404).json({ success: false, message: 'Invalid user' });

  try {
    const salt = await bcrypt.hash(newPassword, 10);
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
    const allUsers = await User.find({}, { username: true, isLogged: true });
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
    await User.findByIdAndUpdate(_id, secureUpdate, { new: true });

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
