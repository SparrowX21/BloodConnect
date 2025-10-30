import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  pincode: String,
  // Add more profile fields as needed
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
