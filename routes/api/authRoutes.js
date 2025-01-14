import express from 'express';
import { authenticateToken } from '../../middlewares/authToken.js';
import { authorizeRole, authorizeRoles } from '../../middlewares/authRole.js';

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Profile data', user: req.user });
});

router.get('/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.status(200).json({ message: 'Admin panel' });
});

router.get(
  '/manager',
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  (req, res) => {
    res.status(200).json({ message: 'Manager panel' });
  }
);

export default router;