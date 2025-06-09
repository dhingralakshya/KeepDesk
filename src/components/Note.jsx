import React, { useEffect, useRef, useState } from "react";
import ManageNote from "./ManageNote";
import DeleteIcon from "@mui/icons-material/Delete";

function Note(props) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteData, setNoteData] = useState({
    title:props.title,
    content: props.content
  });

  const modalRef = useRef(null);

  function handleClick() {
    props.onDelete(props.id);
  }
  function handleUpdate(updatedNote){
    setNoteData({
      title: updatedNote.title,
      content:updatedNote.content
    });
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if(e.key==="Escape"){
        setSelectedNote(null);
      }
    };
    const handleClickOutside = (e) =>{
      if(modalRef.current && !modalRef.current.contains(e.target)){
        setSelectedNote(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [props]);
  return (
    <>
      <div className="note" onClick={() => setSelectedNote(props.id)}>
        <h1>{noteData.title}</h1>
        <p>{noteData.content}</p>
        <button onClick={handleClick}>
          <DeleteIcon />
        </button>
      </div>
      {selectedNote && (
          <div>
            <ManageNote
              id={props.id}
              title={noteData.title}
              content={noteData.content}
              onClose={() => setSelectedNote(null)}
              onUpdate={handleUpdate}
              modalRef={modalRef}
            />
          </div>
      )}
    </>
  );
}

export default Note;
