import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Access denied. Only admins can perform this action.' });
    }
};
