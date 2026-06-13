const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const generateToken = require('../utils/generateToken');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        socialLinks: user.socialLinks,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        socialLinks: user.socialLinks,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        socialLinks: user.socialLinks,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

      if (req.body.socialLinks) {
        user.socialLinks = {
          twitter: req.body.socialLinks.twitter !== undefined ? req.body.socialLinks.twitter : user.socialLinks.twitter,
          github: req.body.socialLinks.github !== undefined ? req.body.socialLinks.github : user.socialLinks.github,
          linkedin: req.body.socialLinks.linkedin !== undefined ? req.body.socialLinks.linkedin : user.socialLinks.linkedin,
          website: req.body.socialLinks.website !== undefined ? req.body.socialLinks.website : user.socialLinks.website
        };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        socialLinks: updatedUser.socialLinks,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Upload profile picture
 * @route   POST /api/auth/profile/picture
 * @access  Private
 */
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profilePicture) {
      const oldImagePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const profilePicturePath = `/uploads/profiles/${req.file.filename}`;
    user.profilePicture = profilePicturePath;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      message: 'Profile picture uploaded successfully'
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete profile picture
 * @route   DELETE /api/auth/profile/picture
 * @access  Private
 */
const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profilePicture) {
      const imagePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      user.profilePicture = null;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: null,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Validate OAuth token, verify user exists, log details, and generate session
 * @route   POST /api/auth/social-login
 * @access  Public
 */
const socialLogin = async (req, res) => {
  const { provider, accessToken } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  if (!provider || !accessToken) {
    return res.status(400).json({ message: 'Provider and access token are required' });
  }

  const normalizedProvider = provider.toLowerCase();
  if (normalizedProvider !== 'google' && normalizedProvider !== 'github' && normalizedProvider !== 'linkedin') {
    return res.status(400).json({ message: 'Invalid provider' });
  }

  let email = '';
  let providerUserId = '';
  let verificationStatus = 'failed';

  try {
    if (accessToken.startsWith('mock-token-')) {
      // Mock OAuth Flow for local testing / development
      email = accessToken.substring('mock-token-'.length).trim().toLowerCase();
      
      // Basic email regex validation
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        verificationStatus = 'failed_invalid_mock_token_email';
        await AuthLog.create({
          provider: provider,
          userId: 'N/A',
          email: email || 'invalid-mock-token',
          verificationStatus,
          ipAddress,
          userAgent
        });
        return res.status(400).json({ message: 'Authentication failed. Invalid mock token format.' });
      }
      providerUserId = `mock-${normalizedProvider}-${email.split('@')[0]}`;
    } else {
      // Real OAuth Token Verification
      if (normalizedProvider === 'google') {
        try {
          const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          if (!response.data || !response.data.email) {
            throw new Error('No email returned from Google');
          }
          
          if (!response.data.email_verified) {
            verificationStatus = 'failed_unverified_email';
            await AuthLog.create({
              provider: 'Google',
              userId: response.data.sub || 'N/A',
              email: response.data.email,
              verificationStatus,
              ipAddress,
              userAgent
            });
            return res.status(400).json({ message: 'Google account could not be verified. Email is unverified.' });
          }

          email = response.data.email.toLowerCase();
          providerUserId = response.data.sub;
        } catch (err) {
          verificationStatus = 'failed_invalid_google_token';
          await AuthLog.create({
            provider: 'Google',
            userId: 'N/A',
            email: 'N/A',
            verificationStatus,
            ipAddress,
            userAgent
          });
          return res.status(401).json({ message: 'Google account could not be verified.' });
        }
      } else if (normalizedProvider === 'github') {
        try {
          const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
          });

          if (!userResponse.data || !userResponse.data.id) {
            throw new Error('Invalid response from GitHub');
          }

          providerUserId = String(userResponse.data.id);

          // Fetch emails to get primary and verified emails
          const emailsResponse = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `token ${accessToken}` }
          });

          const primaryEmailObj = emailsResponse.data.find(e => e.primary && e.verified);
          if (!primaryEmailObj) {
            verificationStatus = 'failed_unverified_github_email';
            await AuthLog.create({
              provider: 'GitHub',
              userId: providerUserId,
              email: userResponse.data.email || 'N/A',
              verificationStatus,
              ipAddress,
              userAgent
            });
            return res.status(400).json({ message: 'GitHub account could not be verified. No verified primary email found.' });
          }

          email = primaryEmailObj.email.toLowerCase();
        } catch (err) {
          verificationStatus = 'failed_invalid_github_token';
          await AuthLog.create({
            provider: 'GitHub',
            userId: 'N/A',
            email: 'N/A',
            verificationStatus,
            ipAddress,
            userAgent
          });
          return res.status(401).json({ message: 'GitHub account could not be verified.' });
        }
      } else if (normalizedProvider === 'linkedin') {
        try {
          const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          email = response.data.email.toLowerCase();
          providerUserId = response.data.sub;
        } catch (err) {
          verificationStatus = 'failed_invalid_linkedin_token';
          await AuthLog.create({
            provider: 'LinkedIn',
            userId: 'N/A',
            email: 'N/A',
            verificationStatus,
            ipAddress,
            userAgent
          });
          return res.status(401).json({ message: 'LinkedIn account could not be verified.' });
        }
      }
    }

    // Check if the user exists in our database
    const user = await User.findOne({ email });

    if (!user) {
      verificationStatus = 'failed_account_not_found';
      await AuthLog.create({
        provider: provider,
        userId: providerUserId,
        email: email,
        verificationStatus,
        ipAddress,
        userAgent
      });
      return res.status(401).json({ message: 'Authentication failed. Invalid account.' });
    }

    // Validate account status
    if (user.status && user.status !== 'active') {
      verificationStatus = `failed_user_status_${user.status}`;
      await AuthLog.create({
        provider: provider,
        userId: providerUserId,
        email: email,
        verificationStatus,
        ipAddress,
        userAgent
      });
      return res.status(403).json({ message: 'Unauthorized login attempt detected.' });
    }

    // Verification successful
    verificationStatus = 'success';
    await AuthLog.create({
      provider: provider,
      userId: providerUserId,
      email: email,
      verificationStatus,
      ipAddress,
      userAgent
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      socialLinks: user.socialLinks,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Social login verification error:', error);
    verificationStatus = 'failed_server_error';
    await AuthLog.create({
      provider: provider,
      userId: providerUserId || 'N/A',
      email: email || 'N/A',
      verificationStatus,
      ipAddress,
      userAgent
    });
    res.status(500).json({ message: 'Server error during social login verification' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  socialLogin
};
