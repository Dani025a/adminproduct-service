import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoute';
import productViewRoutes from './routes/productViewRoute';
import categoryRoutes from './routes/categoryRoute';
import cors from 'cors';
import filterRoutes from './routes/filterRoute'
dotenv.config();

const app = express();

app.use(
    cors({
      origin: process.env.ADMIN_FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true, 
    })
  );

app.use(express.json());


app.use('/api', productRoutes);
app.use('/api', productViewRoutes);
app.use('/api', categoryRoutes);
app.use('/api', filterRoutes);

export default app;
