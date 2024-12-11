import { prisma } from '../models';

export const logProductView = async (productId: number, userId: number | null, sessionId: string | null, ip: string | null) => {
  return await prisma.productView.create({
    data: {
      productId,
      userId,
      sessionId,
      ip,
    },
  });
};
