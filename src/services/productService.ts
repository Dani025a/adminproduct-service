import { prisma } from '../models';
import { uploadImage } from '../utils/googleCloudStorage';
import { MESSAGES } from '../utils/messages';
import { ProductData, GetProductsOptions, Filter } from '../interfaces/productInterfaces';


export const createProductService = async (data: ProductData) => {
  const {
    name,
    description,
    price,
    stock,
    brand,
    weight,
    length,
    width,
    height,
    status,
    seoTitle,
    seoDescription,
    metaKeywords,
    subSubCategoryId,
    discountId,
    images,
    filters,
  } = data;

  try {
    const imageUrls = images && Array.isArray(images)
      ? await Promise.all(
          images.map(async (image) => {
            if (typeof image === 'string') {
              return image;
            } else {
              return await uploadImage(image);
            }
          })
        )
      : [];

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        brand,
        weight,
        length,
        width,
        height,
        status,
        seoTitle,
        seoDescription,
        metaKeywords,
        subSubCategoryId,
        discountId,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
    });

    if (filters && Array.isArray(filters) && filters.length > 0) {

      const validFilters = filters.filter((f: Filter) => f.filterOptionId && f.filterValueId);

      if (validFilters.length !== filters.length) {
        throw new Error('One or more filters are invalid.');
      }

      await prisma.productFilter.createMany({
        data: validFilters.map((f: Filter) => ({
          productId: product.id,
          filterValueId: f.filterValueId,
        })),
        skipDuplicates: true,
      });
    } else {
      console.log('No filters provided or filters array is empty');
    }

    const productWithFilters = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        discount: true,
        reviews: true,
        images: true,
        filters: {
          include: {
            filterValue: {
              include: {
                filterOption: true,
              },
            },
          },
        },
      },
    });

    return productWithFilters;
  } catch (error) {
    console.error('Detailed error in createProductService:', error);
    throw new Error(MESSAGES.PRODUCT.CREATION_ERROR);
  }
};

const buildRangeCondition = (rangeField?: string, minRange?: number, maxRange?: number) => {
  if (!rangeField || (minRange === undefined && maxRange === undefined)) return undefined;
  return {
    [rangeField]: {
      ...(minRange !== undefined ? { gte: minRange } : {}),
      ...(maxRange !== undefined ? { lte: maxRange } : {}),
    },
  };
};


export const getProductsByCategoryAndFiltersService = async ({
  mainCategoryId,
  subCategoryId,
  subSubCategoryId,
  filterValueId,
  rangeField,
  minRange,
  maxRange,
  sortBy,
  sortOrder = 'asc',
}: GetProductsOptions) => {
  try {
    const rangeCondition = buildRangeCondition(rangeField, minRange, maxRange);

    const products = await prisma.product.findMany({
      where: {
        subSubCategory: subSubCategoryId
          ? { id: subSubCategoryId }
          : subCategoryId
          ? { subCategory: { id: subCategoryId } }
          : mainCategoryId
          ? { subCategory: { mainCategory: { id: mainCategoryId } } }
          : undefined,
        filters: filterValueId ? { some: { filterValueId } } : undefined,
        ...rangeCondition,
      },
      include: {
        discount: true,
        reviews: true,
        images: true,
        filters: {
          where: filterValueId ? { filterValueId } : undefined,
          include: {
            filterValue: {
              include: {
                filterOption: true,
              },
            },
          },
        },
      },
      orderBy: [
        sortBy === 'price'
          ? { price: sortOrder }
          : sortBy === 'name'
          ? { name: sortOrder }
          : sortBy === 'reviews'
          ? { reviews: { _count: sortOrder } }
          : sortBy === 'discount'
          ? { discount: { percentage: sortOrder } }
          : undefined,
      ].filter(Boolean),
    });

    if (sortBy === 'mostSold') {
      products.sort((a, b) => (sortOrder === 'asc' ? a.sales - b.sales : b.sales - a.sales));
    }

    return products;
  } catch (error) {
    console.error('Detailed error in getProductsByCategoryAndFiltersService:', error);
    throw new Error(MESSAGES.PRODUCT.FETCH_ERROR);
  }
};

export const getAllProductsService = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        discount: true,
        reviews: true,
        images: true,
        filters: {
          include: {
            filterValue: {
              include: {
                filterOption: true,
              },
            },
          },
        },
      },
    });

    return products;
  } catch (error) {
    console.error('Detailed error in getAllProductsService:', error);
    throw new Error(MESSAGES.PRODUCT.FETCH_ERROR);
  }
};


export const getProductByIdService = async (id: number) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        discount: true,
        reviews: true,
        images: true,
        filters: {
          include: {
            filterValue: {
              include: {
                filterOption: true,
              },
            },
          },
        },
      },
    });

    return product;
  } catch (error) {
    console.error('Detailed error in getProductByIdService:', error);
    throw new Error(MESSAGES.PRODUCT.FETCH_ERROR);
  }
};

export const updateProductService = async (id: number, data: ProductData) => {
  const {
    name,
    description,
    price,
    stock,
    brand,
    weight,
    length,
    width,
    height,
    status,
    seoTitle,
    seoDescription,
    metaKeywords,
    subSubCategoryId,
    discountId,
    images,
    filters,
  } = data;

  const existingImageUrls = images
    ?.filter((image) => typeof image === 'string' && image.startsWith('http')) as string[] || [];

  const newImageFiles = images
    ?.filter((image) => typeof image !== 'string') as Express.Multer.File[] || [];

  const uploadedImageUrls = newImageFiles.length > 0
    ? await Promise.all(newImageFiles.map(uploadImage))
    : [];

  const allImageUrls = [...existingImageUrls, ...uploadedImageUrls];

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        brand,
        weight,
        length,
        width,
        height,
        status,
        seoTitle,
        seoDescription,
        metaKeywords,
        subSubCategoryId,
        discountId,
        images: {
          deleteMany: {}, 
          create: allImageUrls.map((url) => ({ url })), 
        },
      },
    });

    if (filters && Array.isArray(filters)) {
      await prisma.productFilter.deleteMany({
        where: { productId: id },
      });

      if (filters.length > 0) {
        const validFilters = filters.filter((f: Filter) => f.filterOptionId && f.filterValueId);

        if (validFilters.length !== filters.length) {
          throw new Error('One or more filters are invalid.');
        }

        await prisma.productFilter.createMany({
          data: validFilters.map((f: Filter) => ({
            productId: id,
            filterValueId: f.filterValueId,
          })),
          skipDuplicates: true,
        });
      }
    }

    const updatedProductWithFilters = await prisma.product.findUnique({
      where: { id },
      include: {
        discount: true,
        reviews: true,
        images: true,
        filters: {
          include: {
            filterValue: {
              include: {
                filterOption: true,
              },
            },
          },
        },
      },
    });

    return updatedProductWithFilters;
  } catch (error) {
    console.error('Detailed error in updateProductService:', error);
    throw new Error(MESSAGES.PRODUCT.ERROR_UPDATING_PRODUCT);
  }
};


export const deleteProductService = async (id: number) => {
  try {
    await prisma.productFilter.deleteMany({
      where: { productId: id },
    });

    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.image.deleteMany({ where: { productId: id } });

    await prisma.product.delete({ where: { id } });
  } catch (error) {
    console.error('Detailed error in deleteProductService:', error);
    throw new Error(MESSAGES.PRODUCT.ERROR_DELETING_PRODUCT);
  }
};
