import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import cors from 'cors';
import bodyParser from 'body-parser';
import appConfig from './config/appConfig.js';
import campaignsRoutes from './routes/campaigns.js';

console.log("[LOG] === openAI key :", process.env.OPENAI_API_KEY ? "Loaded ✅" : "Undefined ❌");

const openai = new OpenAI({
// Actual Key entry .DO NOT Upload it Github.
  apiKey: 'sk-',
});

const { LOG_ALL, SERVER_PORT } = appConfig;

const app = express();
const log = (...args) => { if (LOG_ALL) console.log('[LOG]', ...args); };
const elog = (...args) => { console.error('[ERROR]', ...args); };

app.use(cors());
app.use(bodyParser.json());
app.use('/api/campaigns', campaignsRoutes);

log('=== BloodConnect Server Starting ===');


const SmtpSettingsSchema = new mongoose.Schema({ smtpUser: String, smtpPass: String });
const SmtpSettings = mongoose.model('SmtpSettings', SmtpSettingsSchema);

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  bloodType: String,
  pincode: String,
  phone: String,
  availableToDonate: { type: Boolean, default: false },
});

const User = mongoose.model('User', UserSchema);

const OtpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expires: Date,
});
const Otp = mongoose.model('Otp', OtpSchema);

const BloodRequestSchema = new mongoose.Schema({
  patientEmail: String,
  patientName: String,
  bloodType: String,
  pincode: String,
  phone: String,
  status: { type: String, default: "pending" },
  responderEmail: String,
  responderName: String,
  responderPhone: String,
  rejectedDonors: [String],
  createdAt: { type: Date, default: Date.now },
});
const BloodRequest = mongoose.model('BloodRequest', BloodRequestSchema);

let transporter;
async function setupTransporter() {
  log('Loading SMTP credentials from DB...');
  try {
    const doc = await SmtpSettings.findOne();
    if (!doc) {
      elog('No SMTP credentials set up in DB.');
      return;
    }
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: doc.smtpUser, pass: doc.smtpPass }
    });
    log('SMTP transporter initialized for:', doc.smtpUser);
  } catch (error) {
    elog('setupTransporter error:', error);
  }
}

async function startServer() {
  try {
    await setupTransporter();
    app.listen(SERVER_PORT, () => {
      log(`API server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    elog('startServer error:', error);
  }
}

const sendMail = async (to, subject, text) => {
  if (!transporter) {
    elog('No SMTP transporter initialized');
    throw new Error('SMTP not ready');
  }
  try {
    let info = await transporter.sendMail({ from: transporter.options.auth.user, to, subject, text });
    log('Email sent to', to, 'messageId:', info.messageId);
    return info;
  } catch (err) {
    elog('sendMail error:', err);
    throw err;
  }
};



app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    log('/api/send-otp', email);
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp, expires });
    await sendMail(email, "Your BloodConnect OTP", `Your OTP is: ${otp}`);
    log('OTP sent for', email, 'OTP:', otp);
    return res.json({ success: true });
  } catch (error) {
    elog('send-otp:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/clear-pending-requests', async (req, res) => {
  try {
    const { patientEmail } = req.body;
    console.log('[clear-pending-requests] Request received for email:', patientEmail);

    if (!patientEmail) {
      console.warn('[clear-pending-requests] Error: Missing patientEmail in request body');
      return res.status(400).json({ success: false, error: "Missing patientEmail" });
    }
    // Show how many requests are about to be deleted
    const toDelete = await BloodRequest.countDocuments({
      patientEmail,
      status: "pending"
    });
    console.log(`[clear-pending-requests] Found ${toDelete} pending requests to delete for ${patientEmail}`);

    // Only delete requests with status 'pending'
    const result = await BloodRequest.deleteMany({
      patientEmail,
      status: "pending"
    });

    if (result.deletedCount !== undefined) {
      console.log(`[clear-pending-requests] Deleted ${result.deletedCount} pending requests for ${patientEmail}`);
    } else {
      console.warn('[clear-pending-requests] Warning: No requests deleted');
    }

    return res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('[clear-pending-requests] Fatal Error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});


app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    log('/api/verify-otp', email, otp);

    const record = await Otp.findOne({ email, otp });
    if (!record) {
      log('otp not found for', email);
      return res.json({ success: false, error: 'Invalid OTP' });
    }
    if (Date.now() > record.expires.getTime()) {
      log('OTP expired for', email);
      await Otp.deleteMany({ email });
      return res.json({ success: false, error: 'OTP expired' });
    }
    await Otp.deleteMany({ email });
    log('OTP verified for', email);
    return res.json({ success: true });
  } catch (error) {
    elog('verify-otp:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    log('/api/register', req.body);
    const { name, email, bloodType, pincode, phone } = req.body;

    if (await User.findOne({ email })) {
      return res.status(409).json({ error: 'Already registered.' });
    }
    const user = new User({ name, email, bloodType, pincode, phone });
    await user.save();
    log('User registered:', user);
    return res.json({ success: true });
  } catch (error) {
    elog('register:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/check-user', async (req, res) => {
  try {
    const { email } = req.body;
    log('/api/check-user', email);
    const user = await User.findOne({ email });
    return res.json({ registered: !!user });
  } catch (error) {
    elog('check-user:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/get-profile', async (req, res) => {
  try {
    const { email } = req.body;
    log('/api/get-profile', email);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user });
  } catch (error) {
    elog('get-profile:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/request-blood', async (req, res) => {
  try {
    const { patientEmail, patientName, bloodType, pincode, phone } = req.body;
    log('Blood request:', patientEmail, bloodType, pincode, phone);

    const request = new BloodRequest({
      patientEmail, 
      patientName,
      bloodType, 
      pincode,
      phone,
      status: "pending"
    });

    await request.save();
    log('Blood request saved:', request._id);
    return res.json({ success: true, requestId: request._id });
  } catch (error) {
    elog('request-blood endpoint:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/update-profile', async (req, res) => {
  const { email, ...profileData } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Missing email in update" });

  try {
    const user = await User.findOneAndUpdate({ email }, profileData, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, message: "Profile updated", user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/pending-requests', async (req, res) => {
  try {
    const { pincode, email } = req.body;
    log('Getting pending requests for pincode:', pincode, 'user:', email);
    const requests = await BloodRequest.find({
      pincode,
      status: 'pending',
      patientEmail: { $ne: email },
      rejectedDonors: { $ne: email }
    }).sort({ createdAt: -1 });
    log('Found requests:', requests.length);
    return res.json({ success: true, requests });
  } catch (error) {
    elog('pending-requests:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/respond-request', async (req, res) => {
  try {
    const { requestId, donorEmail, donorName, donorPhone, accepted } = req.body;
    log('Responding to request:', requestId, 'accepted:', accepted, 'donor:', donorEmail);

    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (accepted) {
      request.status = "accepted";
      request.responderEmail = donorEmail;
      request.responderName = donorName;
      request.responderPhone = donorPhone;
      await request.save();
      log('Request accepted by:', donorEmail);
      return res.json({ success: true, message: "Request accepted!" });
    } else {
      request.rejectedDonors = request.rejectedDonors || [];
      request.rejectedDonors.push(donorEmail);
      await request.save();
      log('Request rejected by:', donorEmail);
      return res.json({ success: true, message: "Request rejected" });
    }
  } catch (error) {
    elog('respond-request:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/my-requests', async (req, res) => {
  try {
    const { patientEmail } = req.body;
    log('Getting requests for patient:', patientEmail);
    const requests = await BloodRequest.find({ patientEmail }).sort({ createdAt: -1 });
    log('Found patient requests:', requests.length);
    return res.json({ success: true, requests });
  } catch (error) {
    elog('my-requests:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

import { BloodBankCache } from './models/BloodBankCache.js';

async function getBloodBanksFromGenAI(pincode) {
  // Check cache first
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let cached = await BloodBankCache.findOne({ pincode });

  if (cached && cached.updatedAt > oneWeekAgo) {
    return cached.data; // fresh data
  }

  // No cache or stale, fetch from OpenRouter
  const prompt = `
You are an assistant who retrieves real-world data and formats it as valid JSON.
List up to 10 blood banks near the US PIN CODE "${pincode}".
For each provide:
- name,
- address (with city and pin code),
- contact phone,
- timings (if available),
- any current or upcoming donation campaigns (as a short description, or null if none).

Format the output as an array of up to 10 JSON objects with these fields: name, address, contact, timings, campaign.

If no information is available, return an empty array.
`;

  const OPENROUTER_API_KEY = "sk-...";  // Actual Key entry .DO NOT Upload it Github.

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [
        { role: "system", content: "You return only a valid JSON array, no commentary." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.2
    })
  });

  const chatRes = await res.json();
  let text = chatRes.choices?.[0]?.message?.content?.trim() || "";
	if (!text) {
	console.error("No response from GenAI for blood banks, got empty string");
	  return [];
	}
	console.log(text);
  try {

	  if (text.startsWith("```json")) text = text.slice(7);
	  if (text.startsWith("```")) text = text.slice(3);
	  if (text.endsWith("```")) text = text.slice(0, -3);
	  const banks = JSON.parse(text);


    // Store or update in DB
    await BloodBankCache.findOneAndUpdate(
      { pincode },
      { data: banks, updatedAt: new Date() },
      { upsert: true }
    );

    return Array.isArray(banks) ? banks : [];
  } catch (e) {
    console.error("GenAI parse error for blood banks:", e, "\nText was:\n", text);
    return [];
  }
}




async function getBloodBanksFromGenAIGPT(pincode) {
  const prompt = `
You are an assistant who retrieves real-world data and formats it as valid JSON.
List up to 10 blood banks near the US PIN CODE "${pincode}".
For each provide:
- name,
- address (with city and pin code),
- contact phone,
- timings (if available),
- any current or upcoming donation campaigns (as a short description, or null if none).

Format the output as an array of up to 10 JSON objects with these fields: name, address, contact, timings, campaign.

If no information is available, return an empty array.
`;
  const chatRes = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You return only a valid JSON array, no commentary." },
      { role: "user", content: prompt }
    ],
    max_tokens: 1000,
    temperature: 0.2,
  });
  try {
	  let text = chatRes.choices.message.content.trim();
	  if (text.startsWith("```json")) text = text.slice(7);
	  if (text.startsWith("```")) text = text.slice(3);
	  if (text.endsWith("```")) text = text.slice(0, -3);
	  const banks = JSON.parse(text);
	  return Array.isArray(banks) ? banks : [];
  }catch (e) {
	console.error("GenAI parse error for blood banks:", e, "\nText was:\n", text);
  return [];
  }
}

app.post('/api/nearby-blood-banks', async (req, res) => {
  const { pincode } = req.body;
  log(pincode)
  try {
    const banks = await getBloodBanksFromGenAI(pincode);
    res.json({ success: true, banks: banks.slice(0, 10) });
  } catch (err) {
    console.error("GenAI endpoint error:", err);
    res.status(500).json({ success: false, error: 'Could not retrieve blood bank info.' });
  }
});


app.post('/api/donate', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { availableToDonate: true } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ success: true, user });
  } catch (error) {
    elog('donate:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/set-smtp', async (req, res) => {
  try {
    const { smtpUser, smtpPass } = req.body;
    log('/api/set-smtp', smtpUser);
    await SmtpSettings.deleteMany({});
    await SmtpSettings.create({ smtpUser, smtpPass });
    await setupTransporter();
    return res.json({ success: true });
  } catch (error) {
    elog('set-smtp:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

mongoose.connect('mongodb://localhost:27017/bloodconnect')
  .then(() => {
    log('MongoDB connected successfully!');
    startServer();
  })
  .catch(err => {
    elog('MongoDB connection error:', err);
  });
