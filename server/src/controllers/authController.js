import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';
import { alertRepository } from '../repositories/alertRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'krishisakhi_secret_jwt_key_2026_xyz';

export const register = async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' });
  }

  try {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      full_name,
      email,
      password: hashedPassword,
      role: 'farmer',
      phone
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log the action
    await alertRepository.logAction(user.id, 'Registered new user account');

    // Create a welcome notification
    await alertRepository.createNotification(user.id, {
      title: 'Welcome to KrishiSakhi',
      message: `Hello ${full_name}! Welcome to KrishiSakhi. Start by adding your farms and registering your current crops to get precision AI recommendations.`,
      type: 'general'
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await alertRepository.logAction(user.id, 'Logged in to account');

    return res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const admin = await userRepository.findAdminByEmail(email);
    if (!admin) {
      // Check in general users if role is admin
      const generalUser = await userRepository.findByEmail(email);
      if (generalUser && generalUser.role === 'admin') {
        const isMatch = await bcrypt.compare(password, generalUser.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid admin credentials.' });
        }
        const token = jwt.sign(
          { id: generalUser.id, email: generalUser.email, role: 'admin', name: generalUser.full_name },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({
          token,
          user: {
            id: generalUser.id,
            full_name: generalUser.full_name,
            email: generalUser.email,
            role: 'admin',
            phone: generalUser.phone
          }
        });
      }
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin', name: admin.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: admin.id,
        full_name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Server error during admin login.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    let user;
    if (req.user.role === 'admin') {
      user = await userRepository.findAdminById(req.user.id);
    } else {
      user = await userRepository.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({
      id: user.id,
      full_name: req.user.role === 'admin' ? user.name : user.full_name,
      email: user.email,
      role: user.role || 'admin',
      phone: user.phone,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error retrieving profile.' });
  }
};
