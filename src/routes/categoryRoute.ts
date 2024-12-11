import express from 'express';
import CategoryController from '../controllers/categoryController';

const router = express.Router();

router.post('/main-category', CategoryController.createMainCategory);
router.post('/sub-category', CategoryController.createSubCategory);
router.post('/sub-sub-category', CategoryController.createSubSubCategory);

router.get('/main-categories', CategoryController.getAllMainCategories);
router.get('/sub-categories', CategoryController.getAllSubCategories);
router.get('/sub-sub-categories', CategoryController.getAllSubSubCategories);

router.put('/main-category/:id', CategoryController.updateMainCategory);
router.put('/sub-category/:id', CategoryController.updateSubCategory);
router.put('/sub-sub-category/:id', CategoryController.updateSubSubCategory);

router.delete('/main-category/:id', CategoryController.deleteMainCategory);
router.delete('/sub-category/:id', CategoryController.deleteSubCategory);
router.delete('/sub-sub-category/:id', CategoryController.deleteSubSubCategory);

export default router;
