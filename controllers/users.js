const router = require('express').Router();

const { User, Blog } = require('../models');

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] },
    },
  });
  res.json(users);
});

/* Get user with readings data + info with reading lists*/
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['name', 'username'],
      include: [
        {
          model: Blog,
          as: 'readings',
          attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
          through: {
            attributes: ['read', 'id'],
          },
        },
      ],
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.params.username,
      },
    });

    if (!user) return res.status(404).end();

    user.name = req.body.name;
    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
