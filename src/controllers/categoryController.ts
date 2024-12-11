import { prisma } from '../models';
import { Request, Response } from 'express';
import { MESSAGES } from '../utils/messages';
import { categoryPublisher } from '../rabbitmq/categoryPublisher';

class CategoryController {

  static async createMainCategory(req: Request, res: Response) {
    const { name } = req.body;
    try {
      const mainCategory = await prisma.mainCategory.create({ data: { name } });
      await categoryPublisher('category', { action: 'create', type: 'mainCategory', data: mainCategory });
      res.status(201).json(mainCategory);
    } catch (error) {
      res.status(500).json({ error: MESSAGES.CATEGORY.MAIN_CATEGORY_CREATION_ERROR });
    }
  }

  static async updateMainCategory(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;
    try {
      const mainCategory = await prisma.mainCategory.update({
        where: { id: parseInt(id) },
        data: { name },
      });
      await categoryPublisher('category', { action: 'update', type: 'mainCategory', data: mainCategory });
      res.status(200).json(mainCategory);
    } catch (error) {
      res.status(500).json({ error: MESSAGES.CATEGORY.MAIN_CATEGORY_UPDATE_ERROR });
    }
  }

  static async deleteMainCategory(req: Request, res: Response) {
    const { id } = req.params;
    const mainCategoryId = parseInt(id);
    try {
      await prisma.$transaction(async (prisma) => {
        const subCategories = await prisma.subCategory.findMany({
          where: { mainCategoryId },
        });

        const subCategoryIds = subCategories.map((sc) => sc.id);

        const subSubCategories = await prisma.subSubCategory.findMany({
          where: { subCategoryId: { in: subCategoryIds } },
        });

        const subSubCategoryIds = subSubCategories.map((ssc) => ssc.id);

        await prisma.product.updateMany({
          where: { subSubCategoryId: { in: subSubCategoryIds } },
          data: { subSubCategoryId: null },
        });

        await prisma.subSubCategory.deleteMany({
          where: { subCategoryId: { in: subCategoryIds } },
        });

        await prisma.subCategory.deleteMany({
          where: { mainCategoryId },
        });

        const mainCategory = await prisma.mainCategory.delete({
          where: { id: mainCategoryId },
        });

        await categoryPublisher('category', {
          action: 'delete',
          type: 'mainCategory',
          data: mainCategory,
        });

        res.status(200).json(mainCategory);
      });
    } catch (error) {
      console.error('Error deleting main category:', error);
      res
        .status(500)
        .json({ error: MESSAGES.CATEGORY.MAIN_CATEGORY_DELETE_ERROR });
    }
  }

  static async getAllMainCategories(req: Request, res: Response) {
    try {
      const mainCategories = await prisma.mainCategory.findMany({
        include: {
          subCategories: true,
        },
      });
      res.status(200).json(mainCategories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch main categories' });
    }
  }


  static async createSubCategory(req: Request, res: Response) {
    const { name, mainCategoryId } = req.body;
    try {
      const subCategory = await prisma.subCategory.create({
        data: {
          name,
          mainCategory: { connect: { id: mainCategoryId } },
        },
      });
      await categoryPublisher('category', { action: 'create', type: 'subCategory', data: subCategory });
      res.status(201).json(subCategory);
    } catch (error) {
      res.status(500).json({ error: MESSAGES.CATEGORY.SUB_CATEGORY_CREATION_ERROR });
    }
  }

  static async updateSubCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, mainCategoryId } = req.body;
      const subCategory = await prisma.subCategory.update({
        where: { id: Number(id) },
        data: {
          name,
          mainCategoryId: mainCategoryId ? Number(mainCategoryId) : undefined,
        },
        include: {
          mainCategory: true,
        },
      });
      res.status(200).json(subCategory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update sub-category' });
    }
  }
  

  static async deleteSubCategory(req: Request, res: Response) {
    const { id } = req.params;
    const subCategoryId = parseInt(id);
    try {
      await prisma.$transaction(async (prisma) => {
        const subSubCategories = await prisma.subSubCategory.findMany({
          where: { subCategoryId },
        });

        const subSubCategoryIds = subSubCategories.map((ssc) => ssc.id);

        await prisma.product.updateMany({
          where: { subSubCategoryId: { in: subSubCategoryIds } },
          data: { subSubCategoryId: null }, 
        });

        await prisma.subSubCategory.deleteMany({
          where: { subCategoryId },
        });

        const subCategory = await prisma.subCategory.delete({
          where: { id: subCategoryId },
        });

        await categoryPublisher('category', {
          action: 'delete',
          type: 'subCategory',
          data: subCategory,
        });

        res.status(200).json(subCategory);
      });
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      res
        .status(500)
        .json({ error: MESSAGES.CATEGORY.SUB_CATEGORY_DELETE_ERROR });
    }
  }
  static async getAllSubCategories(req: Request, res: Response) {
    try {
      const subCategories = await prisma.subCategory.findMany({
        include: {
          mainCategory: true,
        },
      });
      res.status(200).json(subCategories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch subcategories' });
    }
  }

  static async createSubSubCategory(req: Request, res: Response) {
    const { name, subCategoryId } = req.body;
    try {
      const subSubCategory = await prisma.subSubCategory.create({
        data: {
          name,
          subCategory: { connect: { id: subCategoryId } },
        },
      });
      await categoryPublisher('category', { action: 'create', type: 'subSubCategory', data: subSubCategory });
      res.status(201).json(subSubCategory);
    } catch (error) {
      res.status(500).json({ error: MESSAGES.CATEGORY.SUB_SUB_CATEGORY_CREATION_ERROR });
    }
  }

  static async updateSubSubCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, subCategoryId } = req.body;
      const subSubCategory = await prisma.subSubCategory.update({
        where: { id: Number(id) },
        data: {
          name,
          subCategoryId: subCategoryId ? Number(subCategoryId) : undefined,
        },
        include: {
          subCategory: {
            include: {
              mainCategory: true,
            },
          },
        },
      });

      console.log(subSubCategory)

      res.status(200).json(subSubCategory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update sub-sub-category' });
    }
  }

  static async deleteSubSubCategory(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const subSubCategory = await prisma.subSubCategory.delete({ where: { id: parseInt(id) } });
      await categoryPublisher('category', { action: 'delete', type: 'subSubCategory', data: subSubCategory });
      res.status(200).json(subSubCategory);
    } catch (error) {
      res.status(500).json({ error: MESSAGES.CATEGORY.SUB_SUB_CATEGORY_DELETE_ERROR });
    }
  }

  static async getAllSubSubCategories(req: Request, res: Response) {
    try {
      const subSubCategories = await prisma.subSubCategory.findMany({
        include: {
          subCategory: {
            include: {
              mainCategory: true,
            },
          },
        },
      });
  
      res.status(200).json(subSubCategories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch sub-subcategories' });
    }
  }

}


export default CategoryController;
