import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import axios from "axios";


function NoteApp() {
  const [notes, setNotes] = useState([]);
  const apiUrl = window._env_ && window._env_.REACT_APP_API_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  React.useEffect(() => {
    axios.get(`${apiUrl}`, getAuthHeaders())
      .then((res) => setNotes(res.data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const postData=async(title,content)=>{
    const data={title,content};
    const response=await axios.post(`${apiUrl}`,data, getAuthHeaders());
    return response.data;
  }
  const postDelete=async(_id)=>{    
    await axios.post(`${apiUrl}/delete`,{id:_id}, getAuthHeaders());
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
      await postDelete(id);
      setNotes(prevNotes => prevNotes.filter(note => note._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
    
  }

  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      <div className="notes-container">
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
      </div>
      <Footer />
    </div>
  );
}

export default NoteApp;
