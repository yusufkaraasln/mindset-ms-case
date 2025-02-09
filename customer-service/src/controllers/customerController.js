import { Customer } from '../models/customerModel.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';

// All customers are fetched with filtering, sorting and pagination
export const getCustomers = async (req, res) => {
  try {
    const { 
      search, 
      company,
      sortBy = 'createdAt', 
      order = 'desc',
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};
     if (company) filter.company = company;
    if (search) {
      filter.$text = { $search: search };
    }
    
    const sortOrder = order === 'asc' ? 1 : -1;
    const customers = await Customer.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Customer.countDocuments(filter);
    
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        customers,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching customers:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

// Fetch a single customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: ERROR_MESSAGES.CUSTOMER_NOT_FOUND
      });
    }
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: customer
    });
  } catch (error) {
    logger.error('Error fetching customer:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, company, status } = req.body;
    const customer = new Customer({
      firstName,
      lastName,
      email,
      phone,
      company,
     });
    await customer.save();
    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: SUCCESS_MESSAGES.CUSTOMER_CREATED,
      data: customer
    });
  } catch (error) {
    logger.error('Error creating customer:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

// Update an existing customer
export const updateCustomer = async (req, res) => {
  try {
    const updateData = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: ERROR_MESSAGES.CUSTOMER_NOT_FOUND
      });
    }
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.CUSTOMER_UPDATED,
      data: customer
    });
  } catch (error) {
    logger.error('Error updating customer:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: ERROR_MESSAGES.CUSTOMER_NOT_FOUND
      });
    }
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.CUSTOMER_DELETED
    });
  } catch (error) {
    logger.error('Error deleting customer:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

// Add a note to a customer
export const addNote = async (req, res) => {
  try {
    const { content } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: ERROR_MESSAGES.CUSTOMER_NOT_FOUND
      });
    }
    customer.notes.push({ content });
    await customer.save();
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: customer
    });
  } catch (error) {
    logger.error('Error adding note:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

// Update a note in a customer
export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: ERROR_MESSAGES.CUSTOMER_NOT_FOUND
      });
    }
    const note = customer.notes.id(noteId);
    if (!note) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: 'Note not found'
      });
    }
    note.content = content;
    await customer.save();
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: customer
    });
  } catch (error) {
    logger.error('Error updating note:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
};

// Delete a note from a customer
export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: ERROR_MESSAGES.CUSTOMER_NOT_FOUND
      });
    }
    const note = customer.notes.id(noteId);
    if (!note) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: 'Note not found'
      });
    }
    note.remove();
    await customer.save();
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: customer
    });
  } catch (error) {
    logger.error('Error deleting note:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_SERVER
    });
  }
}; 