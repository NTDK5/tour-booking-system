import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import {
    authUser,
    registerUser,
    verifyEmail,
    logoutUser,
    getUserProfile,
    updateProfile,
    getAllUsers,
    deleteUser,
    updateUser,
    refresh,
} from '../controllers/userController';
import passport from 'passport';
import { generateAccessToken } from '../utils/tokenUtils';

import { userSchema, loginSchema, updateProfileSchema } from '../schemas/userSchemas';
import { validate } from '../middleware/validationMiddleware';

const router = express.Router();

router.post('/', validate(userSchema), registerUser);
router.get('/verify-email', verifyEmail);
router.post('/auth', authLimiter, validate(loginSchema), authUser);
router.post('/refresh', refresh);
router.post('/logout', logoutUser);

router.get('/', protect, admin, getAllUsers);

router
    .route('/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUser);

router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, validate(updateProfileSchema), updateProfile);

// Google Auth
router.get('/auth/google', authLimiter, passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login',
}), (req: any, res) => {
    const accessToken = generateAccessToken(req.user._id);
    // For OAuth, we might need a way to pass the token or set a cookie
    // Since we use cookies for JWT, we can redirect to a success page that sets the cookie or just set it here
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.redirect(`${process.env.FRONTEND_URL}/auth-success`);
});

export default router;
