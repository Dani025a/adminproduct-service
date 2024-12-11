import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

  const mainCategory1 = await prisma.mainCategory.create({
    data: {
      name: 'Electronics',
    },
  });

  const mainCategory2 = await prisma.mainCategory.create({
    data: {
      name: 'Clothing',
    },
  });

  const subCategory1 = await prisma.subCategory.create({
    data: {
      name: 'Phones & Tablets',
      mainCategoryId: mainCategory1.id,
    },
  });

  const subCategory2 = await prisma.subCategory.create({
    data: {
      name: 'Laptops & Computers',
      mainCategoryId: mainCategory1.id,
    },
  });

  const subCategory3 = await prisma.subCategory.create({
    data: {
      name: 'Men\'s Wear',
      mainCategoryId: mainCategory2.id,
    },
  });

  const subSubCategory1 = await prisma.subSubCategory.create({
    data: {
      name: 'Smartphones',
      subCategoryId: subCategory1.id,
    },
  });

  const subSubCategory2 = await prisma.subSubCategory.create({
    data: {
      name: 'Casual Shirts',
      subCategoryId: subCategory3.id,
    },
  });

  const discount1 = await prisma.discount.create({
    data: {
      percentage: 10.00,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description: '10% off for a limited time',
    },
  });

  const product1 = await prisma.product.create({
    data: {
      name: 'iPhone 14',
      description: 'The latest Apple iPhone with 128GB storage.',
      price: 999.99,
      stock: 50,
      brand: 'Apple',
      weight: 0.5,
      length: 14.0,
      width: 7.0,
      height: 0.7,
      status: 'active',
      seoTitle: 'Buy iPhone 14 Online',
      seoDescription: 'Get the latest iPhone 14 at the best price.',
      metaKeywords: 'iPhone, Apple, smartphone',
      discountId: discount1.id,
      subSubCategoryId: subSubCategory1.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Casual Shirt',
      description: 'A stylish and comfortable casual shirt for men.',
      price: 39.99,
      stock: 200,
      brand: 'BrandX',
      weight: 0.2,
      length: 70.0,
      width: 50.0,
      height: 1.0,
      status: 'active',
      seoTitle: 'Men\'s Casual Shirt',
      seoDescription: 'Buy high-quality casual shirts online.',
      metaKeywords: 'Shirt, casual, men\'s wear',
      subSubCategoryId: subSubCategory2.id,
    },
  });

  const filterOption1 = await prisma.filterOption.create({
    data: {
      name: 'Brand',
      type: 'dropdown',
    },
  });

  const filterOption2 = await prisma.filterOption.create({
    data: {
      name: 'Color',
      type: 'checkbox',
    },
  });

  const filterValue1 = await prisma.filterValue.create({
    data: {
      value: 'Apple',
      filterOptionId: filterOption1.id,
    },
  });

  const filterValue2 = await prisma.filterValue.create({
    data: {
      value: 'Black',
      filterOptionId: filterOption2.id,
    },
  });

  const filterValue3 = await prisma.filterValue.create({
    data: {
      value: 'White',
      filterOptionId: filterOption2.id,
    },
  });

  await prisma.productFilter.create({
    data: {
      filterValueId: filterValue1.id,
      products: {
        connect: { id: product1.id },
      },
    },
  });

  await prisma.productFilter.create({
    data: {
      filterValueId: filterValue2.id,
      products: {
        connect: { id: product2.id },
      },
    },
  });

  await prisma.image.create({
    data: {
      url: 'https://example.com/images/iphone14.jpg',
      productId: product1.id,
    },
  });

  await prisma.image.create({
    data: {
      url: 'https://example.com/images/casualshirt.jpg',
      productId: product2.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Great product, highly recommend!',
      productId: product1.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Nice shirt, fits perfectly.',
      productId: product2.id,
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
