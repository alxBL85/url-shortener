const express = require('express');
const { postShorten, getStats, getCode } = require('../controllers/urlController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/shorten", authenticateToken, postShorten);
router.get("/:code", authenticateToken, getCode);
router.get("/stats/:code", authenticateToken, getStats);

module.exports = router;