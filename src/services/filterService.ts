import { prisma } from '../models';
import { FilterType } from '../interfaces/productInterfaces';

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

    // Extract filterOptions from the relations
    const filters = subSubCategory.categoryFilterOptionCategories
      .map((relation) => relation.categoryFilterOption?.filterOption)
      .filter((f): f is {id: number; name: string; type: FilterType} => Boolean(f));

    if (filters.length === 0) {
      // No filters found for this sub-subcategory
      return [];
    }

    const filterIds = filters.map((filter) => filter.id);
    const filterValues = await prisma.filterValue.findMany({
      where: { filterOptionId: { in: filterIds } },
    });

    // Match each filter with its values
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

    // Validate filterValues: For sliders, no filterValues needed
    const validatedFilterValues = filterType === 'slider'
      ? []
      : filterValues.map((value) => value.trim()).filter((value) => value.length > 0);

    // Create the filterOption
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
    });

    // Create the categoryFilterOption
    const categoryFilterOption = await prisma.categoryFilterOption.create({
      data: {
        filterOptionId: filterOption.id,
      },
    });

    // Associate the categoryFilterOption with the subSubCategory
    await prisma.categoryFilterOptionCategory.create({
      data: {
        subSubCategoryId,
        categoryFilterOptionId: categoryFilterOption.id,
      },
    });

    return filterOption;
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

    return prisma.filterValue.create({
      data: {
        value: trimmedValue,
        filterOptionId,
      },
    });
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

    return prisma.productFilter.create({
      data: {
        productId,
        filterValueId,
      },
    });
  }

  // --------------------------------------------
  // Additional methods for completeness:
  // Update and Delete operations to ensure
  // filters can be edited and removed correctly.
  // --------------------------------------------

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

    // Update filter option name/type if provided
    let updatedFilterOption = await prisma.filterOption.update({
      where: { id: filterOptionId },
      data: {
        name: data.name ?? filterOption.name,
        type: data.type ?? filterOption.type,
      },
    });

    // If values are provided, we replace all existing values
    if (data.values) {
      // Delete existing values
      await prisma.filterValue.deleteMany({
        where: { filterOptionId },
      });

      // Create new values
      const validatedValues = data.values.map((val) => val.trim()).filter((v) => v.length > 0);
      if (validatedValues.length > 0) {
        await prisma.filterValue.createMany({
          data: validatedValues.map((value) => ({
            value,
            filterOptionId,
          })),
        });
      }

      // Re-fetch the filterOption to include new values
      updatedFilterOption = await prisma.filterOption.findUniqueOrThrow({
        where: { id: filterOptionId },
        include: { filterValues: true },
      });
    }

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

    // Delete all productFilters linked to these filterValues
    const filterValueIds = filterOption.filterValues.map((fv) => fv.id);
    if (filterValueIds.length > 0) {
      await prisma.productFilter.deleteMany({
        where: { filterValueId: { in: filterValueIds } },
      });
    }

    // Delete filter values
    await prisma.filterValue.deleteMany({
      where: { filterOptionId },
    });

    // Delete categoryFilterOptionCategories
    await prisma.categoryFilterOptionCategory.deleteMany({
      where: {
        categoryFilterOption: {
          filterOptionId,
        },
      },
    });

    // Delete categoryFilterOption
    await prisma.categoryFilterOption.deleteMany({
      where: { filterOptionId },
    });

    // Finally, delete the filterOption
    await prisma.filterOption.delete({ where: { id: filterOptionId } });

    return true;
  }

  static async deleteFilterValue(filterValueId: number) {
    const filterValue = await prisma.filterValue.findUnique({
      where: { id: filterValueId },
    });

    if (!filterValue) {
      throw new Error('Filter value not found');
    }

    // Delete productFilters linked to this filterValue
    await prisma.productFilter.deleteMany({
      where: { filterValueId },
    });

    // Delete the filterValue
    await prisma.filterValue.delete({
      where: { id: filterValueId },
    });

    return true;
  }
  
  static async updateFilterValue(filterValueId: number, value: string) {
    const filterValue = await prisma.filterValue.findUnique({
      where: { id: filterValueId },
    });
  
    if (!filterValue) {
      throw new Error('Filter value not found');
    }
  
    if (!value.trim()) {
      throw new Error('Filter value cannot be empty');
    }
  
    return prisma.filterValue.update({
      where: { id: filterValueId },
      data: { value },
    });
  }
  

}

export default FilterService;
