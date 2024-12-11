// controllers/ProductController.ts

import { Request, Response } from 'express';
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from '../services/productService';
import { MESSAGES } from '../utils/messages';
import { parseProductData, parseProductFilters } from '../utils/requestParsers';

class ProductController {
  static async createProduct(req: Request, res: Response) {
    try {
      console.log('Request Body:', req.body);
      console.log('Filters:', req.body.filters);

      // **Parse 'filters' if it's a string**
      if (typeof req.body.filters === 'string') {
        try {
          req.body.filters = JSON.parse(req.body.filters);
        } catch (parseError) {
          console.error('Error parsing filters:', parseError);
          return res.status(400).json({ message: 'Invalid filters format. Must be a valid JSON array.' });
        }
      }

      const productData = parseProductData({ ...req.body, files: req.files });

      if (!productData.filters || !Array.isArray(productData.filters)) {
        return res.status(400).json({ message: MESSAGES.PRODUCT.INVALID_FILTER_VALUES });
      }

      const product = await createProductService(productData);
      res.status(201).json({ message: MESSAGES.PRODUCT.PRODUCT_CREATED, product });
    } catch (error) {
      console.error('Error in createProduct:', error);
      const errorMessage = error instanceof Error ? error.message : MESSAGES.PRODUCT.ERROR_CREATING_PRODUCT;
      res.status(500).json({ message: MESSAGES.PRODUCT.ERROR_CREATING_PRODUCT, error: errorMessage });
    }
  }

  static async getProducts(req: Request, res: Response) {
    try {
      const filters = parseProductFilters(req.query);
      const products = await getAllProductsService(filters);
      res.status(200).json(products);
    } catch (error) {
      console.error('Error in getProducts:', error);
      const errorMessage = error instanceof Error ? error.message : MESSAGES.PRODUCT.INTERNAL_ERROR;
      res.status(500).json({ message: MESSAGES.PRODUCT.INTERNAL_ERROR, error: errorMessage });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);

      if (isNaN(numericId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
      }

      const product = await getProductByIdService(numericId);

      if (!product) {
        return res.status(404).json({ message: MESSAGES.PRODUCT.NOT_FOUND });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error('Error in getProductById:', error);
      const errorMessage = error instanceof Error ? error.message : MESSAGES.PRODUCT.INTERNAL_ERROR;
      res.status(500).json({ message: MESSAGES.PRODUCT.INTERNAL_ERROR, error: errorMessage });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);

      if (isNaN(numericId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
      }

      // **Parse 'filters' if it's a string**
      if (typeof req.body.filters === 'string') {
        try {
          req.body.filters = JSON.parse(req.body.filters);
        } catch (parseError) {
          console.error('Error parsing filters:', parseError);
          return res.status(400).json({ message: 'Invalid filters format. Must be a valid JSON array.' });
        }
      }

      const productData = parseProductData({ ...req.body, files: req.files });

      // **Updated Validation: Check 'filters' instead of 'filterValues'**
      if (!productData.filters || !Array.isArray(productData.filters)) {
        return res.status(400).json({ message: MESSAGES.PRODUCT.INVALID_FILTER_VALUES });
      }

      const updatedProduct = await updateProductService(numericId, productData);
      res.status(200).json({ message: MESSAGES.PRODUCT.PRODUCT_UPDATED, updatedProduct });
    } catch (error) {
      console.error('Error in updateProduct:', error);
      const errorMessage = error instanceof Error ? error.message : MESSAGES.PRODUCT.ERROR_UPDATING_PRODUCT;
      res.status(500).json({ message: MESSAGES.PRODUCT.ERROR_UPDATING_PRODUCT, error: errorMessage });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);

      if (isNaN(numericId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
      }

      await deleteProductService(numericId);
      res.status(200).json({ message: MESSAGES.PRODUCT.PRODUCT_DELETED });
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      const errorMessage = error instanceof Error ? error.message : MESSAGES.PRODUCT.ERROR_DELETING_PRODUCT;
      res.status(500).json({ message: MESSAGES.PRODUCT.ERROR_DELETING_PRODUCT, error: errorMessage });
    }
  }
}

export default ProductController;
