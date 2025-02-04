const express=require("express");
const bodyParser=require("body-parser");
const cors=require("cors");
const mongoose=require("mongoose");

const app=express();

mongoose.connect("mongodb+srv://dhingralakshya290:lakshya01@cluster0.91azbdh.mongodb.net/keeperDB")

const notesSchema={
    title:String,
    note:String
}

const Note=mongoose.model("Note",notesSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

const corsOptions={
    origin:'*',
    credentials:true,
    optionSuccessStatus:200 
}

app.use(cors(corsOptions));

app.get('/',async function(req,res){
    
    const Notes=await Note.find({});
    if(Notes){
        console.log(Notes);
        
        res.send(JSON.stringify(Notes));
    }

})

app.post('/',function(req,res){
    const notes=req.body;
    console.log(notes.title);
    
})


app.listen(4000,()=>{
    console.log(`Server is running on port 4000`);
    
})