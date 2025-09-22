import 'dotenv/config';              // load env early
import dotenv from 'dotenv'
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config()

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on('error', (err) => {
      console.log('server error: ', err);
    })

    app.listen(port, () => {
      console.log(`server listening on ${port}`);
    })
  })
  .catch((err) => console.log("MONGO db connection failed", err));