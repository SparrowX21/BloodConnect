import fs from 'fs/promises';
import mongoose from 'mongoose';
import { BloodBankCache } from './BloodBankCache.js';

async function batchInsertBloodBanksFromFile(filePath) {
  await mongoose.connect('mongodb://localhost:27017/bloodconnect');
  const entries = JSON.parse(await fs.readFile(filePath, 'utf-8'));

  for (const entry of entries) {
    await BloodBankCache.findOneAndUpdate(
      { pincode: entry.zip_code },
      { data: entry.data, updatedAt: new Date() },
      { upsert: true }
    );
    console.log("Upserted cache for", entry.zip_code);
  }

  await mongoose.disconnect();
}

batchInsertBloodBanksFromFile('./models/bloodbanks.txt');
