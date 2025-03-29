const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletType: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  problemDescription: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  documents: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

WalletSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = Wallet; 