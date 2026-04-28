const express = require('express');
const authRoutes = require('./src/routes/authRoutes');
const urlRoutes = require('./src/routes/urlRoutes');

const app = express();
app.use(express.json());

app.use('/', authRoutes);
app.use('/', urlRoutes);

app.listen(3000, () => { console.log("alive") });
