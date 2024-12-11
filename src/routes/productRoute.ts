import express from 'express';
import ProductController from '../controllers/productController';
import { validateProductQuery } from '../middleware/validateProductQuery';
import multer from 'multer';

const router = express.Router();

router.get('/products', validateProductQuery, ProductController.getProducts);

const upload = multer({ storage: multer.memoryStorage() });
router.post('/products', upload.array('images'), ProductController.createProduct);
router.get('/products/:id', ProductController.getProductById);
router.put('/products/:id', upload.array('images'), ProductController.updateProduct);
router.delete('/products/:id', ProductController.deleteProduct);
export default router;
