import React, { useState } from 'react';
// Import your createPaste function here
import { createPaste } from '../api/pasteService';

const PasteForm: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [pasteId, setPasteId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createPaste(text);
      console.log('Paste created successfully (UI Layer):', response);
      setPasteId(response.id);
    } catch (err) {
      console.error('Paste creation failed:', err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="paste-text">Enter your text:</label>
        <textarea
          id="paste-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to paste..."
          required
        />
        <button type="submit">Create Paste</button>
      </form>
      {pasteId && <p>Your Paste ID: {pasteId}</p>}
    </div>
  );
};

export default PasteForm;
