import express from 'express';
import {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale
} from '../controllers/saleController.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = express.Router();

// only ADMIN and SALES_REP users can access
router.use(authorizeRoles(['ADMIN', 'SALES_REP']));

// sale endpoints
router.route('/')
  .get(getSales)
  .post(createSale);

router.route('/:id')
  .get(getSaleById)
  .put(updateSale)
  .delete(deleteSale);

export default router;