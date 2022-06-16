import express from 'express';
import mongoose from 'mongoose';

import routes from './routes/routes.js'

/*(async ()=>{
  try {
    await mongoose.connect(
      '',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      }
    );
    console.log('MongoDB connected 💻 ')
  } catch (error) {
    console.log(`MongoDB are not connected: ${error}`)
  }
})()*/

const app = express();

app.use(express.json());

app.use(routes)

app.listen(3333, ()=>{
  console.log('Server started 🚀 ')
})
