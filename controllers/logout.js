const router = require('express').Router();
const { User, Session } = require('../models');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../util/config');

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

router.delete('/', tokenExtractor, async (req, res) => {
  await Session.destroy({
    where: {
      token: req.token,
    },
  });
  res.status(204).end();
});

module.exports = router;
