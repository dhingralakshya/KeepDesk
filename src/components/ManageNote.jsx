import React, { useState } from "react";
import styles from "./ManageNote.module.css";
import axios from "axios";

function ManageNote(props){
    const [note, setNote] = useState({
        title:props.title,
        content: props.content
    });
    const [loading, setLoading]= useState(false);
    const apiUrl = window._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL;

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
            const id=props.id;
            const res= await axios.patch(`${apiUrl}/update/${id}`, updatedFields, getAuthHeaders());
            console.log("Updated", res.data);
            props.onUpdate(res.data);
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