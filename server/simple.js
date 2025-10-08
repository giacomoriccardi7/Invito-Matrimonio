const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Simple Express Server');
});

app.listen(3001, () => {
  console.log('Simple server running on port 3001');
});