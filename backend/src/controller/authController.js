import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GymOwner } from '../model/GymOwner.js';
import { Member } from '../model/Member.js';
import { Trainer } from '../model/Trainer.js';
import { Gym } from '../model/Gym.js';

// Helper function to check email across all user types
const checkEmailExists = async (email) => {
  const gymOwner = await GymOwner.findOne({ email });
  if (gymOwner) return { exists: true, type: 'gym_owner', user: gymOwner };
  
  const member = await Member.findOne({ email });
  if (member) return { exists: true, type: 'member', user: member };
  
  const trainer = await Trainer.findOne({ email });
  if (trainer) return { exists: true, type: 'trainer', user: trainer };
  
  return { exists: false };
};

// Signup Controller
export const signUp = async (req, res) => {
  try {
    const { email, password, userType, profile, gymId, additionalData } = req.body;
    
    // Validation
    if (!email || !password || !userType || !profile) {
      return res.status(400).json({
        success: false,
        message: "Email, password, user type, and profile are required"
      });
    }
    
    if (!profile.firstName || !profile.lastName || !profile.phone) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, and phone are required"
      });
    }
    
    // Check if email exists in any user type
    const emailCheck = await checkEmailExists(email);
    if (emailCheck.exists) {
      return res.status(409).json({
        success: false,
        message: `Email already exists as a ${emailCheck.type.replace('_', ' ')}`
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let newUser;
    let userData;
    
    // Create user based on type
    switch (userType) {
      case 'gym_owner':
        if (!profile.gymName) {
          return res.status(400).json({
            success: false,
            message: "Business name is required for gym owners"
          });
        }
        
        userData = {
          email,
          password: hashedPassword,
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            dateOfBirth: profile.dateOfBirth || null,
            gymName: profile.gymName || " ",
            gymRegistration: profile.gymRegistration || ''
          },
          status: 'pending',
          gyms: [],
          subscription: {
            status: 'active'
          },
          settings: {
            notifications: true,
            emailReports: true
          }
        };
        
        newUser = await GymOwner.create(userData);
        break;
        
      case 'member':
        if (!gymId) {
          return res.status(400).json({
            success: false,
            message: "Gym selection is required for members"
          });
        }
        
        // Verify gym exists and is accepting registrations
        const gymForMember = await Gym.findById(gymId);
        if (!gymForMember) {
          return res.status(404).json({
            success: false,
            message: "Selected gym not found"
          });
        }
        
        if (!gymForMember.isAcceptingRegistrations) {
          return res.status(400).json({
            success: false,
            message: "This gym is not currently accepting new members"
          });
        }
        
        userData = {
          email,
          password: hashedPassword,
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            dateOfBirth: profile.dateOfBirth || null,
            emergencyContact: profile.emergencyContact || '',
            address: profile.address || {}
          },
          gymId: gymId,
          status: 'pending',
          membership: {
            status: 'pending'
          }
        };
        
        newUser = await Member.create(userData);
        break;
        
      case 'trainer':
        if (!gymId) {
          return res.status(400).json({
            success: false,
            message: "Gym selection is required for trainers"
          });
        }
        
        // Verify gym exists
        const gymForTrainer = await Gym.findById(gymId);
        if (!gymForTrainer) {
          return res.status(404).json({
            success: false,
            message: "Selected gym not found"
          });
        }
        
        userData = {
          email,
          password: hashedPassword,
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            dateOfBirth: profile.dateOfBirth || null,
            specialization: profile.specialization || [],
            certification: profile.certification || '',
            experience: profile.experience || 0,
            bio: profile.bio || ''
          },
          gymId: gymId,
          status: 'pending'
        };
        
        // Add additional trainer data if provided
        if (additionalData) {
          if (additionalData.hourlyRate) userData.hourlyRate = additionalData.hourlyRate;
          if (additionalData.schedule) userData.schedule = additionalData.schedule;
        }
        
        newUser = await Trainer.create(userData);
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid user type. Must be: gym_owner, member, or trainer"
        });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        userType: newUser.userType,
        email: newUser.email,
        status: newUser.status
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: getRegistrationMessage(userType),
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        userType: newUser.userType,
        status: newUser.status,
        profile: newUser.profile,
        ...(userType === 'member' || userType === 'trainer' ? { gymId: newUser.gymId } : {})
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }
    
    // Check email in all user types
    const emailCheck = await checkEmailExists(email);
    
    if (!emailCheck.exists) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, emailCheck.user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
    const user = emailCheck.user;
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        userType: user.userType,
        email: user.email,
        status: user.status
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    
    // Prepare user response
    const userResponse = {
      id: user._id,
      email: user.email,
      userType: user.userType,
      status: user.status,
      profile: user.profile
    };
    
    // Add type-specific fields
    if (user.userType === 'member' || user.userType === 'trainer') {
      userResponse.gymId = user.gymId;
    }
    
    if (user.userType === 'gym_owner') {
      userResponse.businessName = user.profile.businessName;
      userResponse.gyms = user.gyms;
    }
    
    res.status(200).json({
      success: true,
      message: getLoginMessage(user),
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Logout Controller
export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const { userId, userType } = req;
    
    let user;
    
    switch (userType) {
      case 'gym_owner':
        user = await GymOwner.findById(userId).select('-password');
        break;
      case 'member':
        user = await Member.findById(userId)
          .select('-password')
          .populate('gymId', 'name address');
        break;
      case 'trainer':
        user = await Trainer.findById(userId)
          .select('-password')
          .populate('gymId', 'name address');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid user type"
        });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Helper Functions
const getRegistrationMessage = (userType) => {
  switch (userType) {
    case 'gym_owner':
      return "Gym owner registration successful! Your account is pending admin approval.";
    case 'member':
      return "Member registration successful! Your membership is pending gym owner approval.";
    case 'trainer':
      return "Trainer registration successful! Your account is pending gym owner approval.";
    default:
      return "Registration successful!";
  }
};

const getLoginMessage = (user) => {
  if (user.status === 'pending') {
    switch (user.userType) {
      case 'gym_owner':
        return "Your account is pending admin approval. You'll be notified when activated.";
      case 'member':
        return "Your membership is pending gym owner approval. You'll be notified when activated.";
      case 'trainer':
        return "Your trainer account is pending gym owner approval. You'll be notified when activated.";
      default:
        return "Your account is pending approval.";
    }
  }
  
  if (user.status === 'suspended') {
    return "Your account has been suspended. Please contact support.";
  }
  
  if (user.status === 'inactive') {
    return "Your account is inactive. Please contact support.";
  }
  
  return "Login successful!";
};