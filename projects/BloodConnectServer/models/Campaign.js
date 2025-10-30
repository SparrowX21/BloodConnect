const mongoose = require('mongoose');
const CampaignSchema = new mongoose.Schema({
  title: String,
  startDate: String,
  endDate: String,
  time: String,
  venue: String,
  incentive: String,
  message: String,
  organizer: {
    name: String,
    email: String
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [lng, lat]
  },
  responses: [
    {
      name: String,
      email: String,
      joined: { type: Date, default: Date.now },
      lat: Number,
      lng: Number
    }
  ]
});
CampaignSchema.index({ location: "2dsphere" });
module.exports = mongoose.model('Campaign', CampaignSchema);
