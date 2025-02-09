import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ["New", "Contacted", "Agreement", "Closed"]
  },
  note: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true
  },
  currentStatus: {
    type: String,
    required: true,
    enum: ["New", "Contacted", "Agreement", "Closed"],
    default: "New"
  },
  history: [statusHistorySchema],
  notes: [{
    type: String
  }]
}, { timestamps: true });

export const Sale = mongoose.model('Sale', saleSchema);