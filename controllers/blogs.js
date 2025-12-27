const router = require('express').Router();
const { Blog, User, Session } = require('../models');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../util/config');
const { Op } = require('sequelize');

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization');

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7);
      console.log(token);

      //check for an existing token in the session
      const session = await Session.findOne({
        where: {
          token,
        },
      });
      if (!session) {
        return res.status(401).json({ error: 'your session expired' });
      }

      //decoded token
      req.decodedToken = jwt.verify(token, SECRET);

      //check if user is disabled
      const user = await User.findByPk(req.decodedToken.id);
      if (user.disabled) {
        return res.status(403).json({ error: 'user disabled' });
      }

      req.token = token;
    } catch (error) {
      console.log(error);
      return res.status(401).json({ error: 'token invalid' });
    }
  } else {
    return res.status(401).json({ error: 'token missing' });
  }
  next();
};

router.get('/', async (req, res) => {
  const where = {};

  if (req.query.search) {
    where[Op.or] = [
      {
        title: {
          [Op.iLike]: `%${req.query.search}%`,
        },
      },
      {
        author: {
          [Op.iLike]: `%${req.query.search}%`,
        },
      },
    ];
  }
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name'],
    },
    where,
    order: [['likes', 'DESC']],
  });
  res.json(blogs);
});

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);
    const blog = await Blog.create({
      ...req.body,
      userId: user.id,
    });
    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
});

/* Update blog likes */
router.put('/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (blog) {
      blog.likes = req.body.likes;
      await blog.save();
      res.json(blog);
    } else {
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', tokenExtractor, async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).end();

    const tokenUserId = Number(req.decodedToken.id);
    console.log('blog.userId:', blog.userId, 'tokenUserId:', tokenUserId);

    if (blog.userId !== tokenUserId) {
      return res.status(403).json({
        error: 'Only the creator can delete this blog!',
      });
    }

    await blog.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
