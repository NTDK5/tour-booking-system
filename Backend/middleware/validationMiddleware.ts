import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import logger from '../utils/logger';

export const validate = (schema: z.ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            logger.warn(`Validation error: ${JSON.stringify(error.issues)}`);
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        next(error);
    }
};
