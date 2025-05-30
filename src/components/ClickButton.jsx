import React, { useState } from 'react';

const ClickButton = () => {
  const [number, setNumber] = useState('');

  const handleClick = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/button-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ number: parseFloat(number) }),
      });

      const data = await res.json();
      console.log("Response from FastAPI:", data.message);
    } catch (err) {
      console.error("Error calling FastAPI:", err);
    }
  };

  return (
    <div style={{ padding: '1em' }}>
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Enter a number"
        style={{ padding: '0.5em', marginRight: '1em', fontSize: '1rem' }}
      />
      <button onClick={handleClick} style={{ padding: '1em', fontSize: '1rem' }}>
        Set Gain
      </button>
    </div>
  );
};

export default ClickButton;
