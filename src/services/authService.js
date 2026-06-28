const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const config = require('../config');
const { generateAccessToken, generateRefreshToken } = require('./tokenService');

/**
 * Register new user
 */
const registerUser = async (userData, ipAddress) => {
  const { name, email, password } = userData;
  
  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });
  
  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id, ipAddress);
  
  return { user, accessToken, refreshToken };
};

/**
 * Login user
 */
const loginUser = async (email, password, ipAddress) => {
  // Check for user
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  // Check if password matches
  const isPasswordMatch = await user.comparePassword(password);
  
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  // Update last login
  user.lastLogin = Date.now();
  await user.save();
  
  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id, ipAddress);
  
  return { user, accessToken, refreshToken };
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
  const fieldsToUpdate = {
    name: updateData.name,
    email: updateData.email,
  };
  
  const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  return user;
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Check current password
  const isPasswordMatch = await user.comparePassword(currentPassword);
  
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
};
