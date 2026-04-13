import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/userModel';
import { sendEmail } from '../utils/email';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenUtils';
import logger from '../utils/logger';
import redis from '../config/redis';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
};

// @desc Auth user & get tokens
// @route POST /api/users/login
// @access Public
export const authUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Phase 3: Login Lockout check
    const lockoutKey = `lockout:${email}`;
    const failedAttempts = await redis.get(`failedAtt:${email}`);

    if (failedAttempts && parseInt(failedAttempts) >= 5) {
        const remainingTime = await redis.ttl(`failedAtt:${email}`);
        res.status(429);
        throw new Error(`Account locked. Try again in ${remainingTime} seconds.`);
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Reset failed attempts on success
        await redis.del(`failedAtt:${email}`);

        const accessToken = generateAccessToken(user._id as any);
        const refreshToken = generateRefreshToken(user._id as any);

        // Hash refresh token before storing
        const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        user.refreshToken = hashedRefreshToken;
        await user.save();

        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            verified: user.verified,
        });
    } else {
        // Increment failed attempts
        const attempts = await redis.incr(`failedAtt:${email}`);
        if (attempts === 1) {
            await redis.expire(`failedAtt:${email}`, 900); // 15 mins
        }

        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc Refresh access token
// @route POST /api/users/refresh
// @access Public
export const refresh = asyncHandler(async (req: any, res: any) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401);
        throw new Error('No refresh token provided');
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id);

        if (!user || !user.refreshToken) {
            res.status(401);
            throw new Error('Invalid refresh token');
        }

        // Verify hashed token
        const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        if (hashedToken !== user.refreshToken) {
            // Potential token reuse/theft - clear for safety
            user.refreshToken = undefined;
            await user.save();
            res.status(401);
            throw new Error('Invalid refresh token');
        }

        const newAccessToken = generateAccessToken(user._id as any);
        const newRefreshToken = generateRefreshToken(user._id as any);

        // Rotation: replace old refresh token
        user.refreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
        await user.save();

        res.cookie('accessToken', newAccessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', newRefreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ status: 'success' });
    } catch (error) {
        res.status(401);
        throw new Error('Token refresh failed');
    }
});

// @desc Register a new user
// @route POST /api/users
// @access Public
export const registerUser = asyncHandler(async (req: any, res: any) => {
    const { first_name, last_name, email, password, country, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
        first_name,
        last_name,
        email,
        password,
        country,
        role: role || 'user',
        verificationToken,
        verified: false,
    });

    if (user) {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        // Send email
        sendEmail({
            email,
            subject: 'Verify Your Email',
            html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
        }).catch(err => logger.error('Email sending failed', err));

        res.status(201).json({
            _id: user._id,
            email: user.email,
            message: 'Registration successful! Please verify your email.',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc Logout user / clear cookie
// @route POST /api/users/logout
// @access Private
export const logoutUser = asyncHandler(async (req: any, res: any) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        const decoded = verifyRefreshToken(refreshToken);
        await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: 1 } });
    }

    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.status(200).json({ message: 'Logged out successfully' });
});

// ... other methods (getUserProfile, getAllUsers, etc.) will follow same pattern
export const getUserProfile = asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export const getAllUsers = asyncHandler(async (req: any, res: any) => {
    const users = await User.find({});
    res.json(users);
});

export const deleteUser = asyncHandler(async (req: any, res: any) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
        res.json({ message: 'User deleted' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export const verifyEmail = asyncHandler(async (req: any, res: any) => {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        res.status(400);
        throw new Error('Invalid verification token');
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
});

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
export const updateProfile = asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.user?._id as any);

    if (user) {
        user.first_name = req.body.first_name || user.first_name;
        user.last_name = req.body.last_name || user.last_name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            email: updatedUser.email,
            role: updatedUser.role,
            verified: updatedUser.verified,
            accessToken: generateAccessToken(updatedUser._id as any),
            refreshToken: generateRefreshToken(updatedUser._id as any),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc Update user (Admin)
// @route PUT /api/users/:id
// @access Private/Admin
export const updateUser = asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.first_name = req.body.first_name || user.first_name;
        user.last_name = req.body.last_name || user.last_name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
