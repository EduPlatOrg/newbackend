import bcrypt from 'bcryptjs';
import { generateTokenAccess } from '../libs/jsonwebtoken.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { sendEmailVerification } from '../services/mailing.js';

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
      phones: [{ phoneNumber: '', phoneDescription: 'Home' }],
      social: [{ media: 'Facebook', user: '@' }],
      address: {
        streetaddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    });
    // TODO: no debería ser con mayúsculas: User.save() ??
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
  console.log(req.params.token, '<--- req.params.token');
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
    res
      .status(200)
      .json({ userFound, message: 'User verified', success: true });
    if (!userFound) {
      return res.status(400).json({ msg: 'User not found' });
    }
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
    console.log(userFound, '<--- userFound');
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
    const userFound = await User.findById(_id);
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
  // console.log('log out controller')
  const { _id } = req.user;
  const { isLogged } = req.body;

  // elimino cookies lo primero
  res.cookie('token', '', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  try {
    const { username } = await User.findOneAndUpdate(
      { _id },
      { isLogged },
      { new: true }
    );
    res.status(200).json({ username, message: 'Logged Out', success: true });
  } catch (error) {
    console.error(error, '<--- ERROR');
    res.status(400).json({ message: 'Error en LogOut' });
  }
};

//TODO: IMPLEMENTAR , FORGOT PASSWORD ( implementado con el email del usuario, nosotros creamos la contraseña actualizamos el usuario y se la enviamos por email), RESET PASSWORD( desde el front lo cambia el usuario, nosotros recibimos el password lo pasamos por el salt y actualizamos el usuer en la db ), UPDATE USER( visibilidad de datos personales, profile picture), ENDPOINT para cojer todos los user ...
