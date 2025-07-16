import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { IconButton, Tooltip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { getPaste } from '../api/pasteService';
import useNotifications from '@/store/notifications';

const PasteViewer: React.FC = () => {
  const [id, setId] = useState<string>('');
  const [paste, setPaste] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const theme = useTheme();
  const [, notificationsActions] = useNotifications();

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

  const handleCopy = async () => {
    if (paste) {
      try {
        await navigator.clipboard.writeText(paste);
        notificationsActions.push({
          message: 'Paste content copied to clipboard!',
          options: {
            variant: 'success',
            autoHideDuration: 3000,
          },
        });
      } catch (err) {
        console.error('Failed to copy:', err);
        notificationsActions.push({
          message: 'Failed to copy paste content',
          options: {
            variant: 'error',
            autoHideDuration: 3000,
          },
        });
      }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Paste Content:</h3>
            <Tooltip title="Copy to Clipboard">
              <IconButton onClick={handleCopy} size="small">
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </div>
          <pre
            style={{
              background:
                theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
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
