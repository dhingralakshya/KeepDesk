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
app.use(cors({ origin: "*", credentials: true }));

// Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes
app.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).send({ message: "User already exists" });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone });
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "6h" });
    res.status(201).send({ token });
  } catch {
    res.status(500).send({ message: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send({ message: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(403).send({ message: "Invalid password" });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "6h" });
    res.status(200).send({ token });
  } catch {
    res.status(500).send({ message: "Login error" });
  }
});

app.get("/user/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ message: "User not found" });
    res.json({ name: user.name });
  } catch {
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/", authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id });
    res.json(notes);
  } catch {
    res.status(500).send({ message: "Error fetching notes" });
  }
});

app.post("/", authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newNote = new Note({ title, content, user: req.user._id });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch {
    res.status(500).send({ message: "Error saving note" });
  }
});

app.patch("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedNote) return res.send({ message: "Note not found" });
    res.json(updatedNote);
  } catch {
    res.send({ message: "Error updating note" });
  }
});

app.post("/delete", authenticateToken, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: req.body.id,
      user: req.user._id,
    });
    if (!deletedNote)
      return res.status(404).send({ message: "Note not found or not owned by user" });

    res.status(200).send({ message: "Note deleted successfully" });
  } catch {
    res.status(500).send({ message: "Error deleting note" });
  }
});

module.exports = app;
