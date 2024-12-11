// src/controllers/filterController.ts

import { Request, Response } from 'express';
import FilterService from '../services/filterService';
import { MESSAGES } from '../utils/messages';
import { FilterType } from '@prisma/client';

class FilterController {

  static async createFilterForSubSubCategory(req: Request, res: Response) {
    try {
      const { subSubCategoryId } = req.params;
      const { filterName, filterValues, filterType } = req.body;

      if (!subSubCategoryId) {
        return res.status(400).json({ message: MESSAGES.FILTER.SUB_SUBCATEGORY_ID_REQUIRED });
      }

      const subSubCategoryIdInt = parseInt(subSubCategoryId, 10);
      if (isNaN(subSubCategoryIdInt)) {
        return res.status(400).json({ message: MESSAGES.FILTER.INVALID_SUB_SUBCATEGORY_ID });
      }

      if (!filterName || !filterType) {
        return res.status(400).json({ message: MESSAGES.FILTER.INVALID_FILTER_PAYLOAD });
      }

      // Only validate `filterValues` for non-slider filters
      if (filterType !== 'slider' && (!Array.isArray(filterValues) || filterValues.length === 0)) {
        return res.status(400).json({ message: MESSAGES.FILTER.INVALID_FILTER_PAYLOAD });
      }

      // Ensure the filter type is valid
      if (!Object.values(FilterType).includes(filterType as FilterType)) {
        return res.status(400).json({ message: MESSAGES.FILTER.INVALID_FILTER_TYPE });
      }

      const newFilter = await FilterService.createFilterForSubSubCategory(
        subSubCategoryIdInt,
        filterName,
        filterValues,
        filterType as FilterType
      );

      res.status(201).json(newFilter);
    } catch (error: any) {
      console.error(error);

      if (error.message === 'Sub-subcategory not found') {
        return res.status(404).json({ message: MESSAGES.FILTER.SUB_SUBCATEGORY_NOT_FOUND });
      }

      res.status(500).json({ message: MESSAGES.FILTER.FILTER_CREATION_ERROR });
    }
  }


  static async getFiltersForSubSubCategory(req: Request, res: Response) {
    try {
      const { subSubCategoryId } = req.params;

      if (!subSubCategoryId) {
        return res.status(400).json({ message: MESSAGES.FILTER.SUB_SUBCATEGORY_ID_REQUIRED });
      }

      const subSubCategoryIdInt = parseInt(subSubCategoryId, 10);
      if (isNaN(subSubCategoryIdInt)) {
        return res.status(400).json({ message: MESSAGES.FILTER.INVALID_SUB_SUBCATEGORY_ID });
      }

      const filters = await FilterService.getFiltersForSubSubCategory(subSubCategoryIdInt);

      res.status(200).json(filters);
    } catch (error: any) {
      console.error(error);

      if (error.message === 'Sub-subcategory not found') {
        return res.status(404).json({ message: MESSAGES.FILTER.SUB_SUBCATEGORY_NOT_FOUND });
      }

      res.status(500).json({ message: MESSAGES.FILTER.FETCH_ERROR });
    }
  }

  static async createFilterValue(req: Request, res: Response) {
    try {
      const { filterOptionId, filterValue } = req.body;

      if (!filterOptionId || !filterValue) {
        return res.status(400).json({ message: MESSAGES.FILTER.INVALID_FILTER_PAYLOAD });
      }

      const filterOptionIdInt = parseInt(filterOptionId, 10);
      if (isNaN(filterOptionIdInt)) {
        return res.status(400).json({ message: MESSAGES.FILTER.INVALID_FILTER_OPTION_ID });
      }

      const newFilterValue = await FilterService.createFilterValue(filterOptionIdInt, filterValue);

      res.status(201).json(newFilterValue);
    } catch (error: any) {
      console.error(error);

      if (error.message === 'Filter option not found') {
        return res.status(404).json({ message: MESSAGES.FILTER.FILTER_OPTION_NOT_FOUND });
      }

      res.status(500).json({ message: MESSAGES.FILTER.FILTER_CREATION_ERROR });
    }
  }


  static async getFilterValuesForOption(req: Request, res: Response) {
    try {
      const { filterOptionId } = req.params;

      if (!filterOptionId) {
        return res.status(400).json({ message: MESSAGES.FILTER.FILTER_OPTION_ID_REQUIRED });
      }

      const filterOptionIdInt = parseInt(filterOptionId, 10);
      if (isNaN(filterOptionIdInt)) {
        return res.status(400).json({ message: MESSAGES.FILTER.INVALID_FILTER_OPTION_ID });
      }

      const filterValues = await FilterService.getFilterValuesForOption(filterOptionIdInt);

      res.status(200).json(filterValues);
    } catch (error: any) {
      console.error(error);

      if (error.message === 'Filter option not found') {
        return res.status(404).json({ message: MESSAGES.FILTER.FILTER_OPTION_NOT_FOUND });
      }

      res.status(500).json({ message: MESSAGES.FILTER.FETCH_ERROR });
    }
  }


  static async createProductFilter(req: Request, res: Response) {
    try {
      const { productId, filterValueId } = req.body;

      if (!productId || !filterValueId) {
        return res.status(400).json({ message: MESSAGES.FILTER.INVALID_PRODUCT_FILTER_PAYLOAD });
      }

      const productIdInt = parseInt(productId, 10);
      const filterValueIdInt = parseInt(filterValueId, 10);

      if (isNaN(productIdInt) || isNaN(filterValueIdInt)) {
        return res.status(400).json({ message: MESSAGES.FILTER.INVALID_PRODUCT_FILTER_IDS });
      }

      const productFilter = await FilterService.createProductFilter(productIdInt, filterValueIdInt);

      res.status(201).json(productFilter);
    } catch (error: any) {
      console.error(error);

      if (
        error.message === 'Product not found' ||
        error.message === 'Filter value not found'
      ) {
        return res.status(404).json({ message: MESSAGES.FILTER.PRODUCT_OR_FILTER_NOT_FOUND });
      }

      res.status(500).json({ message: MESSAGES.FILTER.FILTER_CREATION_ERROR });
    }
  }

  static async updateFilterValue(req: Request, res: Response) {
    try {
      const { filterValueId } = req.params;
      const { value } = req.body;
  
      if (!filterValueId) {
        return res.status(400).json({ message: 'Filter Value ID is required' });
      }
  
      const filterValueIdInt = parseInt(filterValueId, 10);
      if (isNaN(filterValueIdInt)) {
        return res.status(400).json({ message: 'Invalid Filter Value ID' });
      }
  
      if (!value) {
        return res.status(400).json({ message: 'Filter value is required' });
      }
  
      const updatedFilterValue = await FilterService.updateFilterValue(filterValueIdInt, value);
  
      res.status(200).json(updatedFilterValue);
    } catch (error: any) {
      console.error(error);
  
      if (error.message === 'Filter value not found') {
        return res.status(404).json({ message: 'Filter value not found' });
      }
  
      res.status(500).json({ message: 'Failed to update filter value' });
    }
  }
  
}

export default FilterController;
