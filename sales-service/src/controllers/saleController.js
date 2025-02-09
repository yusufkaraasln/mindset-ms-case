import { Sale } from '../models/saleModel.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';

// get sales with filtering and pagination
export const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, customerId, status } = req.query;
    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (status) filter.currentStatus = status;

    const sales = await Sale.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Sale.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        sales,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching sales:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};


export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: ERROR_MESSAGES.NOT_FOUND || 'Sale not found'
      });
    }
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: sale
    });
  } catch (error) {
    logger.error('Error fetching sale:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

// create new sale
export const createSale = async (req, res) => {
  try {
    const { customerId, currentStatus, notes } = req.body;
    // default phase is "New"
    const sale = new Sale({
      customerId,
      currentStatus: currentStatus || "New",
      notes: notes || [],
      history: [{ status: currentStatus || "New", note: "Initial status" }]
    });
    await sale.save();
    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: SUCCESS_MESSAGES.SALE_CREATED || "Sale created successfully",
      data: sale
    });
  } catch (error) {
    logger.error('Error creating sale:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

// update sale for phase changes
export const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: ERROR_MESSAGES.NOT_FOUND || 'Sale not found'
      });
    }
    // if there is a phase change add to history
    if (req.body.currentStatus && req.body.currentStatus !== sale.currentStatus) {
      sale.history.push({
        status: req.body.currentStatus,
        note: req.body.note || "",
        updatedAt: new Date()
      });
      sale.currentStatus = req.body.currentStatus;
    }
    // other fields (notes) can be updated
    if (req.body.notes) {
      sale.notes = req.body.notes;
    }
    await sale.save();
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.SALE_UPDATED || "Sale updated successfully",
      data: sale
    });
  } catch (error) {
    logger.error('Error updating sale:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};


export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: ERROR_MESSAGES.NOT_FOUND || 'Sale not found'
      });
    }
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.SALE_DELETED || "Sale deleted successfully"
    });
  } catch (error) {
    logger.error('Error deleting sale:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};