const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');
const errorHandler = require('./middleware/error');

dotenv.config(({path: './config/config.env'}));

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

// connect to DB
connectDB();

const app = express();

// Body Parser
app.use(express.json());

// dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// file uploading middleware
app.use(fileUpload());

// static folder access
console.log(path.join(__dirname, 'public/'));
app.use(express.static(path.join(__dirname, 'public/')));

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

// error middleware
app.use(errorHandler);

const port = process.env.PORT || 5000;

const server = app.listen(
    port,
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${port}.`.yellow.bold)
);

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close();
    process.exit(1);
});
