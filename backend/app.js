const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

if (process.env.NODE_ENV !== "test") {
  mongoose.connect(process.env.server);
}

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: Number,
});

const User = mongoose.model("User", userSchema);

const notesSchema = {
  title: String,
  content: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
};

const Note = mongoose.model("Note", notesSchema);

app.use(express.json());

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:8080"];

let corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions));

// Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// Routes
app.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone });
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "6h" });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(403).json({ message: "Invalid password" });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "6h" });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

app.get("/user/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

app.get("/", authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes", error: err.message });
  }
});

app.post("/", authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newNote = new Note({ title, content, user: req.user._id });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(500).json({ message: "Error saving note", error: err.message });
  }
});

app.patch("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedNote)
      return res.status(404).json({ message: "Note not found" });
    res.status(200).json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: "Error updating note", error: err.message });
  }
});

app.post("/delete", authenticateToken, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: req.body.id,
      user: req.user._id,
    });
    if (!deletedNote)
      return res.status(404).json({ message: "Note not found or not owned by user" });

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting note", error: err.message });
  }
});

module.exports = app;
