const router = require('express').Router();
const { ReadingList } = require('../models');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../util/config');

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      console.log(authorization.substring(7));
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch (error) {
      console.log(error);
      return res.status(401).json({ error: 'token invalid' });
    }
  } else {
    return res.status(401).json({ error: 'token missing' });
  }
  next();
};

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

/* Tehtävä  13.22*/
router.put('/:id', tokenExtractor, async (req, res, next) => {
  try {
    const reading = await ReadingList.findByPk(req.params.id);
    if (!reading) {
      return res.status(404).json({ error: 'Not found' });
    }

    const tokenUserId = Number(req.decodedToken.id);

    if (reading.userId !== tokenUserId) {
      return res.status(403).json({
        error: 'Only the owner can make changes!',
      });
    }

    reading.read = req.body.read;
    await reading.save();
    res.json(reading);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
