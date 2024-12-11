import { logProductView } from '../services/productViewService';
import { getRelatedProducts } from '../services/relatedProductsService';
import { Request, Response } from 'express';
import { MESSAGES } from '../utils/messages';
import { parseProductViewData } from '../utils/requestParsers';

class ProductViewController {
  static async viewProduct(req: Request, res: Response) {
    try {
      const { productId, userId, sessionId, ip } = parseProductViewData(req);

      await logProductView(productId, userId, sessionId, ip);

      const relatedProducts = await getRelatedProducts(productId);

      res.json({
        success: true,
        relatedProducts,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.PRODUCT.PRODUCT_VIEW_ERROR;
      res.status(500).json({ success: false, message: errorMessage });
    }
  }
}

export default ProductViewController;
