const express = require('express');
const { getAllVideos ,getOneVideo } = require('../controllers/view.controller.js');

const router = express.Router();

router.get('/videos', getAllVideos);
router.get('/video/:id', getOneVideo);

module.exports = router;