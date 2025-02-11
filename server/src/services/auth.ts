import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

export const authenticateGraphQL = (token: string | undefined): { data: JwtPayload } | null => {
  if (!token) return null;
  
  try {
    const secretKey = process.env.JWT_SECRET_KEY || '';
    const decoded = jwt.verify(token.replace('Bearer ', ''), secretKey) as JwtPayload;
    return { data: decoded };
  } catch (error) {
    return null;
  }
};

export const signToken = (username: string, email: string, _id: string): string => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
