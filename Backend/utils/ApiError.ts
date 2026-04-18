/** Express-friendly error with HTTP status (set `res.status` in catch before rethrow). */
export class ApiError extends Error {
    readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }
}
