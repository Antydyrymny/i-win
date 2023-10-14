import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, next: NextFunction) {
    res.status(404);
    const error = new Error(`Not Found: ${req.originalUrl}`);
    next(error);
}

interface ResponseError extends Error {
    status?: number;
}

export function errorHandler(err: ResponseError, req: Request, res: Response) {
    const statusCode = err.status || 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'dev' ? err.stack : undefined,
    });
}
