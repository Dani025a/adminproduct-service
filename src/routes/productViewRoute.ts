import express from 'express';
import ProductViewController from '../controllers/productViewController';

const router = express.Router();

router.get('/product/view/:id', ProductViewController.viewProduct);

export default router;
