
// utils/requestParsers.ts

import { ProductData, GetProductsOptions, Filter } from '../interfaces/productInterfaces';

/**
 * Parses the incoming request data into the ProductData structure.
 * @param data - The raw request data.
 * @returns The parsed ProductData.
 */
export const parseProductData = (data: any): ProductData => {
  return {
    name: data.name,
    description: data.description,
    price: parseFloat(data.price) || 0,
    stock: parseInt(data.stock, 10) || 0,
    brand: data.brand,
    weight: parseFloat(data.weight) || 0,
    length: parseFloat(data.length) || 0,
    width: parseFloat(data.width) || 0,
    height: parseFloat(data.height) || 0,
    status: data.status || 'active',
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    metaKeywords: data.metaKeywords,
    subSubCategoryId: data.subSubCategoryId ? parseInt(data.subSubCategoryId, 10) : undefined,
    discountId: data.discountId ? parseInt(data.discountId, 10) : undefined,
    images: data.files || [],
    filters: Array.isArray(data.filters)
      ? data.filters.map((f: any) => ({
          filterOptionId: f.filterOptionId,
          filterValueId: f.filterValueId,
        }))
      : [],
  };
};

/**
 * Parses the query parameters for fetching products.
 * @param query - The query parameters from the request.
 * @returns The GetProductsOptions object.
 */
export const parseProductFilters = (query: any): GetProductsOptions => {
  return {
    mainCategoryId: query.mainCategoryId ? parseInt(query.mainCategoryId, 10) : undefined,
    subCategoryId: query.subCategoryId ? parseInt(query.subCategoryId, 10) : undefined,
    subSubCategoryId: query.subSubCategoryId ? parseInt(query.subSubCategoryId, 10) : undefined,
    filterValueId: query.filterValueId ? parseInt(query.filterValueId, 10) : undefined,
    rangeField: query.rangeField,
    minRange: query.minRange ? parseFloat(query.minRange) : undefined,
    maxRange: query.maxRange ? parseFloat(query.maxRange) : undefined,
    sortBy: query.sortBy as 'mostSold' | 'reviews' | 'name' | 'discount' | 'price' | undefined,
    sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
  };
};

export const parseProductViewData = (req: Request) => ({
    productId: parseInt(req.params.id, 10),
    userId: req.user?.id || null,
    sessionId: req.sessionID,
    ip: req.ip,
  });
  