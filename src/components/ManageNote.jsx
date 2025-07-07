import React, { useState } from "react";
import styles from "./ManageNote.module.css";
import axios from "axios";
import { useAuth } from "./AuthContext";

function ManageNote(props){
    const [note, setNote] = useState({
        title:props.title,
        content: props.content
    });
    const [loading, setLoading]= useState(false);
    const apiUrl = window._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL;
    const { isAuthenticated } = useAuth();

    const handleChange = (e) =>{
        e.preventDefault();
        const {name,value}=e.target;
        setNote(prev =>({...prev, [name]:value}));
    }
    const getAuthHeaders = () =>{
        const token=localStorage.getItem("token");
        return {
            headers:{
                Authorization : `Bearer ${token}`
            }
        };
    };
    const updateNotesInStorage = (updatedNote) => {
        try{
            const existingNotes = JSON.parse(sessionStorage.getItem("guestNotes") || "[]");
            const updatedNotes = existingNotes.map(note => note._id === updatedNote._id ? updatedNote : note);
            sessionStorage.setItem("guestNotes", JSON.stringify(updatedNotes));
        } catch (error){
            console.log("Error updating note");
        }
    }
    const handleSubmit = async(e) =>{
        e.preventDefault();
        setLoading(true);
        const originalNote = {
            title: props.title,
            content: props.content
        };
        const updatedFields={};
        for(let key in note){
            if(note[key]!==originalNote[key]){
                updatedFields[key] = note[key];               
            }
        }
        if(Object.keys(updatedFields).length===0){
            props.onClose();
            setLoading(false);
            return;
        }
        try{
            let updatedNote;
            if(isAuthenticated){
                const id=props.id;
                const res= await axios.patch(`${apiUrl}/update/${id}`, updatedFields, getAuthHeaders());
                console.log("Updated", res.data);
                updatedNote=res.data;
            } else {
                updatedNote = { ...originalNote, ...updatedFields, _id:props.id };
                updateNotesInStorage(updatedNote);
                console.log("Guest Note Updated", updatedNote);
            }
            if (props.onUpdate) {
                props.onUpdate(updatedNote);
            }
        } catch (err){
            console.log("Error Updating data", err);
        }
        finally{
            props.onClose();
            setLoading(false);
        }
    };
    return (
        <div className={styles.modalBackDrop}>
            <div className={styles.modal} ref={props.modalRef}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title" className="label">
                                Title
                            </label>
                            <input id="title" name="title" className={styles.input} value={note.title} onChange={handleChange} type="text" placeholder="Enter Title" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Content
                            </label>
                            <textarea name="content" className={styles.inputText} onChange={handleChange} value={note.content} placeholder="Enter Content"></textarea>
                        </div>
                    </div>
                    <div className={styles.buttons}>
                        <button type="submit" className={styles.submit} disabled={loading}>{loading? "Submitting":"Submit"}</button>
                        <button type="button" onClick={props.onClose} className={styles.cancel} disabled={loading}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ManageNote;