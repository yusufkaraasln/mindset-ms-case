import express from 'express';
import { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  addNote, 
  updateNote, 
  deleteNote 
} from '../controllers/customerController.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = express.Router();

// Only users with ADMIN and SALES roles can access
router.use(authorizeRoles(['ADMIN', 'SALES_REP']));

// Customers CRUD endpoints
router.post('/', createCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.get('/', getCustomers);

// Customer notes endpoints
router.post('/:id/notes', addNote);
router.put('/:id/notes/:noteId', updateNote);
router.delete('/:id/notes/:noteId', deleteNote);

export default router; 