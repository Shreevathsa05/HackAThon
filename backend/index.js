import 'dotenv/config';              // load env early
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config()


const app = express();
app.use(cors());
app.use(express.json());


app.listen(process.env.PORT || 3000, () =>
    console.log(`API on ${process.env.PORT || 3000}`)
  );