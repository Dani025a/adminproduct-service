import { prisma } from '../models';

export const getRelatedProducts = async (productId: number) => {
  const viewers = await prisma.productView.findMany({
    where: { productId },
    select: {
      sessionId: true,
      userId: true,
    },
  });

  const sessionIds = viewers.map((view) => view.sessionId).filter(Boolean);
  const userIds = viewers.map((view) => view.userId).filter(Boolean);

  const relatedProductViews = await prisma.productView.findMany({
    where: {
      OR: [
        { sessionId: { in: sessionIds } },
        { userId: { in: userIds } },
      ],
      productId: { not: productId },
    },
    distinct: ['productId'],
    take: 5,
  });

  const relatedProductIds = relatedProductViews.map((view) => view.productId);

  return await prisma.product.findMany({
    where: {
      id: { in: relatedProductIds },
    },
  });
};
