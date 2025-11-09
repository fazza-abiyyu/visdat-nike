const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Nike Dashboard Frontend is running' });
});

// Handle API proxy ke backend
app.use('/api', (req, res) => {
    // Proxy ke backend URL
    const backendUrl = process.env.BACKEND_URL || 'https://visdat-nike.vercel.app';
    const url = backendUrl + req.url;
    
    // Redirect ke backend
    res.redirect(307, url);
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Nike Dashboard Frontend running on port ${PORT}`);
    console.log(`📊 Open: http://localhost:${PORT}`);
    console.log(`🔧 Backend URL: ${process.env.BACKEND_URL || 'https://visdat-nike.vercel.app'}`);
});