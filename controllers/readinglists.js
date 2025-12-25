const router = require('express').Router();

const { ReadingList } = require('../models');

router.post('/', async (req, res, next) => {
  try {
    const reading = await ReadingList.create({
      userId: req.body.user_id,
      blogId: req.body.blog_id,
    });
    res.status(201).json(reading);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
