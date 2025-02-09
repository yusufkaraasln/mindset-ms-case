import express from 'express';
import * as userController from '../controllers/userController.js';
import { authorize } from '../middleware/auth.js';
import { validateUser } from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.post('/login', userController.login);  // /api/auth/login with api gateway

// Protected routes
router.use('/users', authorize(['ADMIN']));  // after this all routes are protected by admin role
router.post('/users', validateUser, userController.createUser);
router.get('/users', userController.getUsers);
router.put('/users/:id', validateUser, userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

export default router; 