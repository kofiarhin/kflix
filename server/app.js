const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const preferencesRoutes = require('./routes/preferencesRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.json({ success: true, message: 'welcome to kflix', data: null }));

app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/catalog', catalogRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
