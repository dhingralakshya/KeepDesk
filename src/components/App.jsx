import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import axios from "axios";


function App() {
  const [notes, setNotes] = useState([{}]);

  React.useEffect(() => {
    axios.get('http://localhost:4000')
      .then((res) => setNotes(res.data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const postData=async(title,content)=>{
    const data={title,content};
     
    await axios.post("http://localhost:4000",data);
}


  function addNote(newNote) {
    setNotes(prevNotes => {
      return [...prevNotes, newNote];
    });
    postData(newNote.title,newNote.content);
    
  }

  function deleteNote(id) {
    setNotes(prevNotes => {
      return prevNotes.filter((noteItem, index) => {
        return index !== id;
      });
    });
  }

  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      {notes.map((noteItem, index) => {
        return (
          <Note
            key={index}
            id={index}
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
