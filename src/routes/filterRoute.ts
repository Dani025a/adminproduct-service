import express from 'express';
import FilterController from '../controllers/filterController';

const router = express.Router();

router.post('/:subSubCategoryId/filters', FilterController.createFilterForSubSubCategory);
router.get('/:subSubCategoryId/filters', FilterController.getFiltersForSubSubCategory);
router.post('/filter-values', FilterController.createFilterValue);
router.get('/filter-options/:filterOptionId/values', FilterController.getFilterValuesForOption);
router.post('/product-filters', FilterController.createProductFilter);
router.put('/filter-values/:filterValueId', FilterController.updateFilterValue);
export default router;
