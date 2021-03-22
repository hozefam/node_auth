const express = require('express');
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  },
  () => {
    console.log(`Connected to database`);
  }
);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:4200'
    ]
  })
);
app.use(express.json());
app.use(cookieParser());

const routes = require('./routes/routes');
app.use('/api', routes);

app.get('/', (req, res) => {
  return res.status(200).send({
    message: 'Hello'
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}/`);
});
