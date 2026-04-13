import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { verifyAccessToken } from '../utils/tokenUtils';
import User, { IUser } from '../models/userModel';

declare global {
    namespace Express {
        interface User extends IUser { }
        interface Request {
            user?: IUser;
        }
    }
}

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies?.accessToken;

    // Also check Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401);
                throw new Error('User not found');
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, access token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no access token');
    }
});

export const admin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};
