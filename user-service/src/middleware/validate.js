import { body } from 'express-validator';

export const validateUser = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('roles').optional().isArray(),
  body('firstName').optional().isString(),
  body('lastName').optional().isString()
]; 