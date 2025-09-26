// app.js for all about setting up of express application with the right middleware
import express from 'express';
import logger from '#config/logger.js';
import helmet from "helmet";
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouters from './routes/auth.routes.js'
import { timestamp } from 'drizzle-orm/gel-core';

const app = express();

app.use(helmet());
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(morgan('combined', {stream:{write:(message) => logger.info(message.trim())}}))
app.use(cookieParser())

app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions!')
  res.status(200).json('Hello from Acquisitions!');
});

app.get('/health' , (req , res) => {
  res.status(200).json({status:'Ok' , timestamp: new Date().toISOString(),uptime:process.uptime()});
});

app.get('/api',(req,res) => {
  res.status(200).json({message:"Acquisitons API is running!"});
});


app.use('/api/auth',authRouters)


export default app;
