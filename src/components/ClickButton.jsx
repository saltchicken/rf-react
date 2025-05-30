// src/components/ClickButton.jsx
import React from 'react';

const ClickButton = () => {
  const handleClick = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/button-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("Response from FastAPI:", data.message);
    } catch (err) {
      console.error("Error calling FastAPI:", err);
    }
  };

  return (
    <button onClick={handleClick} style={{ padding: '1em', fontSize: '1rem' }}>
      Send Click to FastAPI
    </button>
  );
};

export default ClickButton;

