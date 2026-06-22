import { Request, Response, NextFunction } from "express";
export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}
export declare function generateToken(userId: string, email: string): string;
export declare function verifyToken(token: string): JwtPayload | null;
export declare function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map