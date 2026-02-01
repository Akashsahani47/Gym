import jwt from 'jsonwebtoken';



import { GymOwner } from '../model/GymOwner.js';
import { Member } from '../model/Member.js';
import { Trainer } from '../model/Trainer.js';


export const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
     
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists in their respective collection
    let user;
    
    switch (decoded.userType) {
      case 'gym_owner':
        user = await GymOwner.findById(decoded.userId);
        break;
      case 'member':
        user = await Member.findById(decoded.userId);
        break;
      case 'trainer':
        user = await Trainer.findById(decoded.userId);
        break;
      default:
        return res.status(401).json({
          success: false,
          message: "Invalid user type"
        });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if account is active
    // if (user.status !== 'active') {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Your account is not activated yet"
    //   });
    // }
    
   // Attach user info to request
req.user = user;
req.userId = user._id;
req.userType = user.userType;
req.userEmail = user.email;
req.userStatus = user.status;

next();

    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Middleware for specific user types
export const requireUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!allowedTypes.includes(req.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required user type: ${allowedTypes.join(' or ')}`
      });
    }
    next();
  };
};