import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  phone: String,
  company: String,
  notes: [noteSchema],
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual field: full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Text search index
customerSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  company: 'text',
  email: 'text'
});

export const Customer = mongoose.model('Customer', customerSchema); 