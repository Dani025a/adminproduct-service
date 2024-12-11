// src/interfaces/productInterfaces.ts

import { Status } from '@prisma/client'; // Ensure this import matches your Prisma setup

/**
 * Represents a single filter applied to a product.
 */
export interface Filter {
  filterOptionId: number;
  filterValueId: number;
}

/**
 * Represents the data required to create or update a product.
 */
export interface ProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  status: Status;
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  subSubCategoryId?: number;
  discountId?: number;
  images: Array<string | Express.Multer.File>;
  filters?: Filter[];
}

/**
 * Represents the options available when fetching products.
 */
export interface GetProductsOptions {
  mainCategoryId?: number;
  subCategoryId?: number;
  subSubCategoryId?: number;
  filterValueId?: number;
  rangeField?: string;
  minRange?: number;
  maxRange?: number;
  sortBy?: 'mostSold' | 'reviews' | 'name' | 'discount' | 'price';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Enumerates the types of filters available.
 */
export enum FilterType {
  checkbox = 'checkbox',
  dropdown = 'dropdown',
  slider = 'slider',
}
