const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer"); // For image upload
const path = require("path");
const helment = require("helmet"); // To protect our routes(like security)
const cors = require("cors");
const mongoose = require("mongoose");
const compression = require("compression");

const db = require("./config/keys").MONGODB_URI;

// Routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const postRoutes = require("./routes/post");
const { static } = require("express");

const app = express();

// File Uplaod Config
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads");
  },
  filename: (req, file, callback) => {
    callback(null, new Date().toISOString() + "-" + file.originalname);
  },
});

// File Type Filter
const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/pdf" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/svg" ||
    file.mimetype === "image/png"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};
/*File Upload ***/

//bodyParser middleware
app.use(bodyParser.json());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("attachment")
); //File upload config
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(helment());
app.use(cors());
app.use(compression());

// Using the Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auth", profileRoutes);
app.use("/api/v1/", postRoutes);


// Static asset if in production
// if(process.env.NODE_ENV === 'production') {
  // Set the static folder
//   app.use(express.static('/build'))

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
//   })
// }

//
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({
    message: message,
    data: data,
  });
});

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    // Node Server
    const port = process.env.PORT || 5000;
    app.listen(port);
    console.log(`localhost:${port}`);
  })
  .catch((err) => {
    console.log(err);
  });
