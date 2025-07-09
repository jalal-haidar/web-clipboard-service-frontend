import React, { useState } from 'react';
// Import your getPaste function here
import { getPaste } from '../api/pasteService';

const PasteViewer: React.FC = () => {
  const [id, setId] = useState<string>('');
  const [paste, setPaste] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleView = async () => {
    if (!id.trim()) {
      setError('Please enter a paste ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getPaste(id);

      setPaste(response.text);
    } catch (err) {
      console.error('Paste fetch failed:', err);
      setError('Failed to fetch paste. Please check the ID and try again.');
      setPaste('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleView();
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="paste-id">Paste ID:</label>
        <input
          id="paste-id"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter paste ID (e.g., abc123)"
          disabled={loading}
        />
        <button onClick={handleView} disabled={loading || !id.trim()}>
          {loading ? 'Loading...' : 'View Paste'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {paste && (
        <div>
          <h3>Paste Content:</h3>
          <pre
            style={{
              background: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {paste}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PasteViewer;
