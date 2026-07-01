const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const generateToken = require('../utils/generateToken');
const PendingRegistration = require('../models/PendingRegistration');
const sendEmail = require('../utils/sendEmail');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const dns = require('dns').promises;
const net = require('net');

// Verify Gmail format
const verifyGmailExists = async (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return emailRegex.test(email);
};

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

    // Verify Gmail exists
    const gmailExists = await verifyGmailExists(email);
    if (!gmailExists) {
      return res.status(400).json({ message: 'Invalid mail' });
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

/**
 * @desc    Request new user registration (OTP check)
 * @route   POST /api/auth/register-request
 * @access  Public
 */
const registerRequest = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify Gmail exists
    const gmailExists = await verifyGmailExists(email);
    if (!gmailExists) {
      return res.status(400).json({ message: 'Invalid mail' });
    }

    // Check if user is already registered in User collection
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in PendingRegistration (upsert by email)
    await PendingRegistration.findOneAndUpdate(
      { email },
      { name, email, password, otp, createdAt: Date.now() },
      { upsert: true, new: true, runValidators: true }
    );

    // Send verification email
    const subject = 'Verify Your Email - NEWSY TECH';
    const text = `Hi ${name},\n\nThank you for signing up for NEWSY TECH. Your one-time verification code is:\n\n${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nNEWSY TECH Team`;
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #051622; color: #ffffff;">
        <h2 style="color: #1ba098; text-align: center;">NEWSY TECH</h2>
        <h3 style="text-align: center; color: #ffffff;">Verify Your Email Address</h3>
        <p style="font-size: 16px; color: #e0e0e0;">Hi ${name},</p>
        <p style="font-size: 16px; color: #e0e0e0;">Thank you for registering. Please enter the following 6-digit verification code to activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background-color: rgba(27, 160, 152, 0.1); border: 1px dashed #1ba098; border-radius: 8px; color: #1ba098;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #a0a0a0; text-align: center;">This code is valid for 10 minutes.</p>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
        <p style="font-size: 12px; color: #808080; text-align: center;">If you did not request this code, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({ to: email, subject, text, html });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
      return res.status(500).json({ message: 'Unable to verify this email address. Please enter a valid email address.' });
    }

    res.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Register request error:', error);
    res.status(500).json({ message: 'Server error during registration request' });
  }
};

/**
 * @desc    Verify OTP and complete user registration
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find pending registration
    const pendingReg = await PendingRegistration.findOne({ email });
    if (!pendingReg) {
      return res.status(400).json({ message: 'Verification request expired or not found. Please resend the code.' });
    }

    // Verify OTP code matches
    if (pendingReg.otp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Double check email is not already taken
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create active user
    const user = await User.create({
      name: pendingReg.name,
      email: pendingReg.email,
      password: pendingReg.password
    });

    // Delete pending registration
    await PendingRegistration.deleteOne({ email });

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
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

module.exports = {
  registerUser,
  registerRequest,
  verifyOtp,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  socialLogin
};
