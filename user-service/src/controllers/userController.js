import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { JWT_CONFIG, HTTP_STATUS, USER_ROLES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

const generateToken = (user) => {
  logger.info('Generating token for user:', { 
    userId: user._id, 
    email: user.email,
    roles: user.roles 
  });
  
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      roles: user.roles  // Add roles to the payload with an array
    },
    JWT_CONFIG.SECRET,
    { 
      expiresIn: JWT_CONFIG.EXPIRES_IN,
      algorithm: 'HS256'
    }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info('Login attempt for:', email);

    // Find user and check password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      logger.error('Invalid credentials for:', email);
      return res.status(401).json({
        status: 'error',
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }

    // Generate token
    const token = generateToken(user);
    logger.info('Login successful for:', email, 'with roles:', user.roles);

    res.json({
      status: 'success',
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      token,
      user: {
        id: user._id,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          roles: user.roles
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: ERROR_MESSAGES.VALIDATION_ERROR
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      status: 'success',
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: ERROR_MESSAGES.VALIDATION_ERROR
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: ERROR_MESSAGES.VALIDATION_ERROR
    });
  }
};

 