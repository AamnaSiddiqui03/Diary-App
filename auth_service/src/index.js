require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Hello, world!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
