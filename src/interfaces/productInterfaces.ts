import { Status } from '@prisma/client';


export interface Filter {
  filterOptionId: number;
  filterValueId: number;
}

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

export enum FilterType {
  checkbox = 'checkbox',
  dropdown = 'dropdown',
  slider = 'slider',
}
