const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  
  const query = {};
  
  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  
  const users = await User.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });
  
  const count = await User.countDocuments(query);
  
  sendSuccess(
    res,
    200,
    {
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
      },
    },
    'Users retrieved successfully'
  );
});

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  sendSuccess(res, 200, { user }, 'User retrieved successfully');
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  sendSuccess(res, 200, { user }, 'User updated successfully');
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  sendSuccess(res, 200, null, 'User deleted successfully');
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
