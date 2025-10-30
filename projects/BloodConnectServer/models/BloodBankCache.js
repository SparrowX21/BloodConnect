const mongoose = require('mongoose');
const BloodBankCacheSchema = new mongoose.Schema({
  pincode: { type: String, required: true, unique: true },
  data: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now }
});
BloodBankCacheSchema.index({ updatedAt: 1 });
module.exports.BloodBankCache = mongoose.model('BloodBankCache', BloodBankCacheSchema);
