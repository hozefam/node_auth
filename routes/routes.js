const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const user = require('../models/user');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { name, email } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({ name, email, password: hashedPassword });
  const result = await user.save();

  const { password, ...data } = result.toJSON();

  res.status(200).send(data);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send({
      message: 'User not found'
    });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({
      message: 'Invalid credentials'
    });
  }

  const token = jwt.sign({ _id: user._id }, process.env.SECRET);

  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  });

  return res.status(200).send({
    message: 'success'
  });
});

router.get('/user', async (req, res) => {
  try {
    const cookie = req.cookies['jwt'];

    const claims = jwt.verify(cookie, process.env.SECRET);

    if (!claims) {
      return res.status(401).send({
        message: 'Unauthenticated'
      });
    }

    const user = await User.findOne({ _id: claims._id });

    const { password, ...data } = await user.toJSON();

    res.status(200).send(data);
  } catch (error) {
    return res.status(401).send({
      message: 'Unauthenticated'
    });
  }
});

router.post('/logout', (req, res) => {
  res.cookie('jwt', '', {
    maxAge: 0
  });

  return res.status(200).send({
    message: 'success'
  });
});

module.exports = router;
