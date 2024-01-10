const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const secretKey = 'nikhilallam'; 

app.post('/login', (req, res) => {
    
  const { username, password } = req.body.credentials;
  if (username && password) {
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

    fs.writeFileSync('token.json', JSON.stringify({ token }));

    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

const authenticateToken = (req, res, next) => {
    console.log("checking", req)
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'This is a protected route', user: req.user });
});

app.get('/employees', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('http://dummy.restapiexample.com/api/v1/employees');
        res.json(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
})

app.get('/employees/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`http://dummy.restapiexample.com/api/v1/employee/${id}`);
        res.json(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
