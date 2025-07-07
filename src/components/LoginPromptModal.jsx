import React from "react";
import { Link } from "react-router-dom";
import styles from "./LoginPromptModal.module.css";
import CloseIcon from '@mui/icons-material/Close';

function LoginPromptModal({ open, onClose }){
    if(!open) return null;
    return(
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <p><Link to="/login" className={styles.link}>Login</Link> to save your notes</p>
            </div>
            <button className={styles.button} onClick={onClose}><CloseIcon /></button>
        </div>
    )
}

export default LoginPromptModal;