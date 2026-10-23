const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const safe = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, country: u.country });
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, country } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (!emailRx.test(email)) return res.status(400).json({ message: 'Invalid email' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    // role is NEVER taken from the request body (prevents privilege escalation)
    const user = await User.create({ name, email, password, country });
    res.status(201).json({ token: sign(user._id), user: safe(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password || ''))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: sign(user._id), user: safe(user) });
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json({ user: safe(req.user) }));

module.exports = router;
