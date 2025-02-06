import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import axios from "axios";


function App() {
  const [notes, setNotes] = useState([]);

  React.useEffect(() => {
    axios.get('http://localhost:4000')
      .then((res) => setNotes(res.data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const postData=async(title,content)=>{
    const data={title,content};
     
    const response=await axios.post("http://localhost:4000",data);
    return response.data;
  }
  const postDelete=async(_id)=>{    
    await axios.post("http://localhost:4000/delete",{id:_id});
  }

  function addNote(newNote) {
    postData(newNote.title, newNote.content)
    .then((savedNote) => {
      setNotes(prevNotes => [...prevNotes, savedNote]);
    })
    .catch(error => console.error("Add error:", error));
    
    
  }

  async function deleteNote(id) {
    
    try {
      await axios.post("http://localhost:4000/delete", { id });
      setNotes(prevNotes => prevNotes.filter(note => note._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
    
  }

  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      {notes.map((noteItem, index) => {
        return (
          <Note
            key={noteItem._id}
            id={noteItem._id}
            title={noteItem.title}
            content={noteItem.content}
            onDelete={deleteNote}
          />
        );
      })}
      <Footer />
    </div>
  );
}

export default App;
