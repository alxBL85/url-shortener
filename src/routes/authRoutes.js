const express = require('express');
const { postRegister, postLogin, postLogout, postRefreshToken } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/register", postRegister);
router.post("/login", postLogin);
router.post("/logout", authenticateToken, postLogout);
router.post('/refresh', authenticateToken, postRefreshToken);

module.exports = router;