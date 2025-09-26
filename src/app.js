// app.js for all about setting up of express application with the right middleware
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.status(200).json('Hello from Acquisitions!');
});

export default app;
