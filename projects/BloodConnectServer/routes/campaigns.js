const express = require('express'), router = express.Router();
const Campaign = require('../models/Campaign.js');

router.get('/by-organizer', async (req, res) => {
  const { email } = req.query;
  const campaigns = await Campaign.find({ "organizer.email": email });
  res.json(campaigns);
});

router.post('/', async (req,res)=>{
  const { lat, lng, ...rest } = req.body;
  const campaign = await Campaign.create({ ...rest, location: { type: 'Point', coordinates: [lng, lat] } });
  res.json({ campaign });
});

router.get('/', async (req,res)=>{
  const { lat, lng } = req.query;
  const near = await Campaign.find({
    location: {
      $near: { $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: 48280 }
    }
  });
  res.json(near);
});

router.post('/:id/respond', async (req,res)=>{
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign.responses.some(r => r.email === req.body.email)) {
    campaign.responses.push({ ...req.body, joined: new Date() });
    await campaign.save();
  }
  res.json({ success: true });
});

router.get('/:id/responses', async (req,res)=>{
  const camp = await Campaign.findById(req.params.id);
  res.json({ responses: camp.responses });
});

module.exports = router;
