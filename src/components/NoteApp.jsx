import React, { useState, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import useSessionNotes from "./useSessionNotes";
import axios from "axios";
import { useAuth } from "./AuthContext";
import LoginPromptModal from "./LoginPromptModal";


function NoteApp() {
  const [notes, setNotes] = useState([]);
  const apiUrl = window._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL;
  const [guestNotes, setGuestNotes] = useSessionNotes("guestNotes", []);
  const migrationCompleted = useRef(false);

  const { token, isAuthenticated } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  const getAuthHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  React.useEffect(() => {
    if(!isAuthenticated){
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (isAuthenticated && !migrationCompleted.current) {
      migrationCompleted.current = true;
      
      if (guestNotes.length > 0) {
        axios.post(`${apiUrl}/migrate`, {notes: guestNotes}, getAuthHeaders())
          .then(() => {
            setGuestNotes([]);
            return axios.get(apiUrl, getAuthHeaders());
          })
          .then(res => setNotes(res.data))
          .catch(err => {
            console.error("Migration Error:", err);
            migrationCompleted.current = false;
          });
      } else {
        axios.get(apiUrl, getAuthHeaders())
          .then(res => setNotes(res.data))
          .catch(err => {
            console.error("Fetch Error:", err);
            migrationCompleted.current = false;
          });
      }
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      migrationCompleted.current = false;
    }
  }, [isAuthenticated]);

  const postData=async(title,content)=>{
    const data={title,content};
    const response=await axios.post(`${apiUrl}`,data, getAuthHeaders());
    return response.data;
  }
  const postDelete=async(_id)=>{    
    await axios.post(`${apiUrl}/delete`,{id:_id}, getAuthHeaders());
  }

  function addNote(newNote) {
    if(isAuthenticated){
      postData(newNote.title, newNote.content)
      .then((savedNote) => {
        setNotes(prevNotes => [...prevNotes, savedNote]);
      })
      .catch(error => console.error("Add error:", error));
    }
    else{
      setGuestNotes(prev=>[...prev, {...newNote, _id:Date.now()}])
    }
  }

  async function deleteNote(id) {
    if(isAuthenticated){
      try {
        await postDelete(id);
        setNotes(prevNotes => prevNotes.filter(note => note._id !== id));
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
    else{
      setGuestNotes(prev => prev.filter(note => note._id!==id));
    }
  }
  const notesToShow = isAuthenticated ? notes : guestNotes;
  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      <div className="notes-container">
        {notesToShow.map((noteItem, index) => {
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
      <LoginPromptModal open={showPrompt} onClose={()=> setShowPrompt(false)} />
      <Footer />
    </div>
  );
}

export default NoteApp;
