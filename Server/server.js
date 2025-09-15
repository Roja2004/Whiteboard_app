// Express app & Socket.io setup
require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const socketSetup = require('./socket');

app.use(cors());
app.use(express.json());

// MongoDB setup
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'));

// API routes
app.use('/api/rooms', require('./routes/rooms'));

// Sockets
socketSetup(server);

// Static files for client (optional for deployment)
// app.use(express.static('../client/build'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});