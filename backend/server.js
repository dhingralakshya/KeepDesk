const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app=express();

mongoose.connect(process.env.server);

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: Number,
  });
  
const User = mongoose.model("User", userSchema);


const notesSchema={
    title:String,
    content:String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}

const Note=mongoose.model("Note",notesSchema);

app.use(express.json());

const corsOptions={
    origin:'*',
    credentials:true,
    optionSuccessStatus:200 
}

app.use(cors(corsOptions));

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN
    if (!token) return res.sendStatus(401);
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }

app.get('/user/:id', authenticateToken, async function(req,res){
  try{
    const user = await User.findById(req.params.id);
    if(!user){
      return res.status(404).send({message: "User not found"});
    }
    res.json({ name:user.name });
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
})

app.get('/',authenticateToken, async function(req,res){
    try{
        const Notes=await Note.find({user:req.user._id});
        if(Notes){
            res.send(JSON.stringify(Notes));
        }
    }
    catch(err){
        res.status(500).send({message:"Error fetching notes"});
    }
})


app.post('/',authenticateToken, async function (req, res) {
    try {
      const { title, content } = req.body;
      const newNote = new Note({ title, content, user: req.user._id });
      const savedNote = await newNote.save();
      res.status(201).send(savedNote);
    } catch (error) {
      res.status(500).send({ message: "Error saving note" });
    }
  });


app.patch("/update/:id", authenticateToken, async function(req,res){
  const { id } = req.params;
  const updatedFields = req.body;
  try{
    const updatedNote = await Note.findByIdAndUpdate({ _id: id, user: req.user._id }, updatedFields, {new:true});
    if(!updatedNote){
      return res.send({ message:"Note not found" });
    }
    return res.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    res.send({ message: "Error updating note" });
  }
})

app.post("/delete",authenticateToken, async function(req,res){
    const { id } = req.body;
    try {
        const deletedNote = await Note.findOneAndDelete({ _id: id, user: req.user._id });
        if (!deletedNote) {
        return res.status(404).send({ message: "Note not found or not owned by user" });
        }
        res.status(200).send({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).send({ message: "Error deleting note" });
    }
})

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
    } catch (err) {
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
    } catch (err) {
      res.status(500).send({ message: "Login error" });
    }
  });

app.listen(process.env.port || 4000,()=>{
    console.log(`Server is running on port 4000`);
})