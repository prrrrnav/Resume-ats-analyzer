const express = require('express');
const app = express();
require('dotenv').config();
const analyzeRoutes = require('./routes/analyze');
const testRoutes = require('./routes/test');  

app.use(express.json());
app.use('/api/analyze', analyzeRoutes);
app.use('/api/test', testRoutes);  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
