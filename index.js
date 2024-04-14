import mongoose from 'mongoose'
import express from "express";
import logger, { loggerMiddleware } from "./src/logger.js";
import helmet from "helmet";

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
}).then(() => {
  logger.info("Database Connected Successfully")
}).catch(() => {
  logger.error("Database cannot be Connected")
})


const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(helmet())
app.use(loggerMiddleware);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// // Register User
// app.post("/signup", async (req, res) => {
//
//     const data = {
//         name: req.body.username,
//         password: req.body.password
//     }
//
//     // Check if the username already exists in the database
//     const existingUser = await collection.findOne({ name: data.name });
//
//     if (existingUser) {
//         res.send('User already exists. Please choose a different username.');
//     } else {
//         // Hash the password using bcrypt
//         const saltRounds = 10; // Number of salt rounds for bcrypt
//         const hashedPassword = await bcrypt.hash(data.password, saltRounds);
//
//         data.password = hashedPassword; // Replace the original password with the hashed one
//
//         const userdata = await collection.insertMany(data);
//         console.log(userdata);
//     }
//
// });
//
// // Login user
// app.post("/login", async (req, res) => {
//     try {
//         const check = await collection.findOne({ name: req.body.username });
//         if (!check) {
//             res.send("User name cannot found")
//         }
//         // Compare the hashed password from the database with the plaintext password
//         const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
//         if (!isPasswordMatch) {
//             res.send("wrong Password");
//         }
//         else {
//             res.render("home");
//         }
//     }
//     catch {
//         res.send("wrong Details");
//     }
// });


app.listen(port, () => {
  console.log(`🚀🚀🚀 TechAway Backend app listening on port ${port}! 🚀🚀🚀`);
});
