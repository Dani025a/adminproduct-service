import { Request, Response, NextFunction } from 'express';
import { MESSAGES } from '../utils/messages';

export const validateProductQuery = (req: Request, res: Response, next: NextFunction) => {
  const { sortBy, sortOrder } = req.query;

  const validSortBy = ['mostSold', 'reviews', 'name', 'discount', 'price'];
  const validSortOrder = ['asc', 'desc'];

  if (sortBy && !validSortBy.includes(sortBy as string)) {
    return res.status(400).json({ error: MESSAGES.QUERY.INVALID_SORT_BY });
  }

  if (sortOrder && !validSortOrder.includes(sortOrder as string)) {
    return res.status(400).json({ error: MESSAGES.QUERY.INVALID_SORT_ORDER });
  }

  next();
};
