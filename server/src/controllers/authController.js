import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import { validationResult } from 'express-validator';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, location, serviceType } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const userData = {
            name,
            email,
            password,
            role: role || 'customer',
            phone,
            location: location || { type: 'Point', coordinates: [0, 0] },
        };

        if (role === 'provider') {
            userData.serviceType = serviceType || 'tow';
            userData.isVerified = false;
            userData.isOnline = false;
        }

        const user = await User.create(userData);

        if (user) {
            const accessToken = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Set cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: accessToken,
            });
        } else {
            res.status(400).json({ msg: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            const accessToken = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Set cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.role === 'provider' ? user.isVerified : undefined,
                token: accessToken,
            });
        } else {
            res.status(401).json({ msg: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ msg: 'Logged out successfully' });
};


// @desc    Update user location
// @route   PUT /api/auth/location
// @access  Private
export const updateLocation = async (req, res) => {
    const { coordinates, address } = req.body; // [longitude, latitude]

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.location = {
            type: 'Point',
            coordinates,
            address: address || user.location.address,
        };

        await user.save();

        res.status(200).json({ msg: 'Location updated', location: user.location });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error updating location' });
    }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
    // ... Implement logic to verify refresh token from cookie and issue new access token
    // This is a placeholder for now
    res.status(501).json({ msg: 'Not implemented yet' });
}
