import React from 'react';
import './Snackbar.scss'; 

const Snackbar = ({ message, type, onClose }) => {
    return (
      <div className={`snackbar snackbar-${type}`}>
        {message}
        <button className="snackbar-close" onClick={onClose}>×</button>
      </div>
    );
  };
  
  export default Snackbar;