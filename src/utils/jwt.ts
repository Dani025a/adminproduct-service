import jwt from 'jsonwebtoken';

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
};