import mongoose from 'mongoose';
import 'dotenv/config';

const mongoDB = process.env.MONGO_URL;

console.log(mongoDB, 'mongoDB');

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
    });
  } catch (error) {
    console.error(error, '<--- ERROR');
  }
};
