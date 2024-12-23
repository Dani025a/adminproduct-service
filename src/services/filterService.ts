import { prisma } from '../models';
import { FilterType } from '../interfaces/productInterfaces';
import { EventType, publishEvent } from '../rabbitmq/filterPublisher';

class FilterService {
  static async getFiltersForSubSubCategory(subSubCategoryId: number) {
    const subSubCategory = await prisma.subSubCategory.findUnique({
      where: { id: subSubCategoryId },
      include: {
        categoryFilterOptionCategories: {
          include: {
            categoryFilterOption: {
              include: {
                filterOption: true,
              },
            },
          },
        },
      },
    });

    if (!subSubCategory) {
      throw new Error('Sub-subcategory not found');
    }

    const filters = subSubCategory.categoryFilterOptionCategories
      .map((relation) => relation.categoryFilterOption?.filterOption)
      .filter((f): f is {id: number; name: string; type: FilterType} => Boolean(f));

    if (filters.length === 0) {
      return [];
    }

    const filterIds = filters.map((filter) => filter.id);
    const filterValues = await prisma.filterValue.findMany({
      where: { filterOptionId: { in: filterIds } },
    });

    return filters.map((filter) => ({
      ...filter,
      values: filterValues.filter((value) => value.filterOptionId === filter.id),
    }));
  }

  static async createFilterForSubSubCategory(
    subSubCategoryId: number,
    filterName: string,
    filterValues: string[],
    filterType: FilterType
  ) {
    const subSubCategory = await prisma.subSubCategory.findUnique({
      where: { id: subSubCategoryId },
    });
  
    if (!subSubCategory) {
      throw new Error('Sub-subcategory not found');
    }
  
    const validatedFilterValues =
      filterType === 'slider'
        ? []
        : filterValues.map((value) => value.trim()).filter((value) => value.length > 0);
  
    const filterOption = await prisma.filterOption.create({
      data: {
        name: filterName,
        type: filterType,
        filterValues: validatedFilterValues.length > 0
          ? {
              create: validatedFilterValues.map((value) => ({ value })),
            }
          : undefined,
      },
      include: {
        filterValues: true,
      },
    });
  
    const categoryFilterOption = await prisma.categoryFilterOption.create({
      data: {
        filterOptionId: filterOption.id,
      },
    });
  
    const categoryFilterOptionCategory = await prisma.categoryFilterOptionCategory.create({
      data: {
        subSubCategoryId,
        categoryFilterOptionId: categoryFilterOption.id,
      },
    });
  

    const result = await prisma.filterOption.findUnique({
      where: { id: filterOption.id },
      include: {
        filterValues: true,
        categoryOptions: { 
          include: {
            categoryRelations: {
              include: {
                mainCategory: true,
                subCategory: true,
                subSubCategory: true,
              },
            },
          },
        },
      },
    });

    await publishEvent(EventType.CREATE_FILTER, result);
  
    return result;
  }

static async createFilterValue(filterOptionId: number, filterValue: string) {
  const trimmedValue = filterValue.trim();
  if (!trimmedValue) {
    throw new Error('Filter value cannot be empty');
  }

  const filterOption = await prisma.filterOption.findUnique({
    where: { id: filterOptionId },
  });

  if (!filterOption) {
    throw new Error('Filter option not found');
  }

  const newFilterValue = await prisma.filterValue.create({
    data: {
      value: trimmedValue,
      filterOptionId,
    },
  });

  const result = await prisma.filterValue.findUnique({
    where: { id: newFilterValue.id },
    include: {
      filterOption: true,
    },
  });

  await publishEvent(EventType.CREATE_FILTER_VALUE, result);

  return result;
}


  static async getFilterValuesForOption(filterOptionId: number) {
    const filterOption = await prisma.filterOption.findUnique({
      where: { id: filterOptionId },
      include: {
        filterValues: true,
      },
    });

    if (!filterOption) {
      throw new Error('Filter option not found');
    }

    return filterOption.filterValues;
  }

  static async createProductFilter(productId: number, filterValueId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
  
    if (!product) {
      throw new Error('Product not found');
    }
  
    const filterValue = await prisma.filterValue.findUnique({
      where: { id: filterValueId },
    });
  
    if (!filterValue) {
      throw new Error('Filter value not found');
    }
  
    const productFilter = await prisma.productFilter.create({
      data: {
        productId,
        filterValueId,
      },
    });
  
    const result = await prisma.productFilter.findUnique({
      where: { id: productFilter.id },
      include: {
        product: true,
        filterValue: {
          include: {
            filterOption: true,
          },
        },
      },
    });

    await publishEvent(EventType.CREATE_PRODUCT_FILTER, result);
  
    return result;
  }
  

  static async updateFilterOption(
    filterOptionId: number,
    data: { name?: string; type?: FilterType; values?: string[] }
  ) {
    const filterOption = await prisma.filterOption.findUnique({
      where: { id: filterOptionId },
      include: { filterValues: true },
    });
  
    if (!filterOption) {
      throw new Error('Filter option not found');
    }
  
    let updatedFilterOption = await prisma.filterOption.update({
      where: { id: filterOptionId },
      data: {
        name: data.name ?? filterOption.name,
        type: data.type ?? filterOption.type,
      },
    });
  
    if (data.values) {
      await prisma.filterValue.deleteMany({
        where: { filterOptionId },
      });
  
      const validatedValues = data.values.map((val) => val.trim()).filter((v) => v.length > 0);
      if (validatedValues.length > 0) {
        await prisma.filterValue.createMany({
          data: validatedValues.map((value) => ({
            value,
            filterOptionId,
          })),
        });
      }
  
      updatedFilterOption = await prisma.filterOption.findUniqueOrThrow({
        where: { id: filterOptionId },
        include: { filterValues: true },
      });
    }

    await publishEvent(EventType.UPDATE_FILTER, updatedFilterOption);
  
    return updatedFilterOption;
  }
  

  static async deleteFilterOption(filterOptionId: number) {
    const filterOption = await prisma.filterOption.findUnique({
      where: { id: filterOptionId },
      include: { filterValues: true },
    });
  
    if (!filterOption) {
      throw new Error('Filter option not found');
    }
  
    const filterValueIds = filterOption.filterValues.map((fv) => fv.id);
    let deletedProductFilters = [];
    if (filterValueIds.length > 0) {
      deletedProductFilters = await prisma.productFilter.findMany({
        where: { filterValueId: { in: filterValueIds } },
      });
      await prisma.productFilter.deleteMany({
        where: { filterValueId: { in: filterValueIds } },
      });
    }
  
    const deletedFilterValues = await prisma.filterValue.findMany({
      where: { filterOptionId },
    });
    await prisma.filterValue.deleteMany({
      where: { filterOptionId },
    });
  
    const deletedCategoryFilterOptionCategories = await prisma.categoryFilterOptionCategory.findMany({
      where: {
        categoryFilterOption: {
          filterOptionId,
        },
      },
    });
    await prisma.categoryFilterOptionCategory.deleteMany({
      where: {
        categoryFilterOption: {
          filterOptionId,
        },
      },
    });
  
    const deletedCategoryFilterOptions = await prisma.categoryFilterOption.findMany({
      where: { filterOptionId },
    });
    await prisma.categoryFilterOption.deleteMany({
      where: { filterOptionId },
    });
  
    await prisma.filterOption.delete({ where: { id: filterOptionId } });

    const result = {
      deletedFilterOption: filterOption,
      deletedFilterValues,
      deletedProductFilters,
      deletedCategoryFilterOptions,
      deletedCategoryFilterOptionCategories,
    };

    await publishEvent(EventType.DELETE_FILTER, result);
  
    return result;
  }
  

  static async deleteFilterValue(filterValueId: number) {
    const filterValue = await prisma.filterValue.findUnique({
      where: { id: filterValueId },
    });
  
    if (!filterValue) {
      throw new Error('Filter value not found');
    }
  
    const deletedProductFilters = await prisma.productFilter.findMany({
      where: { filterValueId },
    });
  
    await prisma.productFilter.deleteMany({
      where: { filterValueId },
    });
  
    await prisma.filterValue.delete({
      where: { id: filterValueId },
    });

    const result = {
      deletedFilterValue: filterValue,
      deletedProductFilters,
    };

    await publishEvent(EventType.DELETE_FILTER_VALUE, result);
  
    return result;
  }
  
  
  static async updateFilterValue(filterValueId: number, value: string) {
    const filterValue = await prisma.filterValue.findUnique({
      where: { id: filterValueId },
      include: { filterOption: true }, // Include associated filter option for context
    });
  
    if (!filterValue) {
      throw new Error('Filter value not found');
    }
  
    if (!value.trim()) {
      throw new Error('Filter value cannot be empty');
    }
  
    const updatedFilterValue = await prisma.filterValue.update({
      where: { id: filterValueId },
      data: { value: value.trim() },
      include: { filterOption: true },
    });

    await publishEvent(EventType.UPDATE_FILTER_VALUE, updatedFilterValue);
  
    return updatedFilterValue;
  }
  

}

export default FilterService;
