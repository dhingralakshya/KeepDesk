const express=require("express");
const bodyParser=require("body-parser");
const cors=require("cors");
const mongoose=require("mongoose");
require("dotenv").config();

const app=express();

mongoose.connect(process.env.server);

const notesSchema={
    title:String,
    content:String
}

const Note=mongoose.model("Note",notesSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const corsOptions={
    origin:'*',
    credentials:true,
    optionSuccessStatus:200 
}

app.use(cors(corsOptions));

app.get('/',async function(req,res){
    
    const Notes=await Note.find({});
    if(Notes){
        
        res.send(JSON.stringify(Notes));
    }

})

// app.post('/',function(req,res){
//     try{
//         const {title,content}=req.body;
//         const newNote = new Note({ title, content });
//         const savedNote=newNote.save();
//         res.status(201).send(savedNote);
//     }
//     catch{
//         res.status(500).send({message:"Error saving note"})
//     }
// })

app.post('/', async function (req, res) {
    try {
      const { title, content } = req.body;
      const newNote = new Note({ title, content });
      // Await the saving operation
      const savedNote = await newNote.save();
      res.status(201).send(savedNote);
    } catch (error) {
      res.status(500).send({ message: "Error saving note" });
    }
  });


app.post("/delete",async function(req,res){
    const { id } = req.body;
    
    
    try {
        await Note.findByIdAndDelete(id);
        
        res.status(200).send({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).send({ message: "Error deleting note" });
    }
    

    
})

app.listen(process.env.port || 4000,()=>{
    console.log(`Server is running on port 4000`);
    
})