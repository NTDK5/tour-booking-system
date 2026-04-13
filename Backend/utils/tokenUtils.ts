import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export interface TokenPayload {
    id: string | Types.ObjectId;
}

export const generateAccessToken = (userId: string | Types.ObjectId): string => {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET || 'access_secret', {
        expiresIn: '15m',
    });
};

export const generateRefreshToken = (userId: string | Types.ObjectId): string => {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret', {
        expiresIn: '7d',
    });
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'access_secret') as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret') as TokenPayload;
};
