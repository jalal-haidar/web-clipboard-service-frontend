// import Typography from '@mui/material/Typography';

// import Meta from '@/components/Meta';
// import { FullSizeCenteredFlexBox } from '@/components/styled';

// function GetPaste() {
//   return (
//     <>
//       <Meta title="Get Paste" />
//       <FullSizeCenteredFlexBox>
//         <Typography variant="h3">Get Paste </Typography>
//       </FullSizeCenteredFlexBox>
//     </>
//   );
// }

// export default GetPaste;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { Visibility, ContentCopy, Share, Download, Clear } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';

import Meta from '@/components/Meta';
import { getPaste } from '@/api/pasteService';

function GetPaste() {
  const [id, setId] = useState<string>('');
  const [paste, setPaste] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const pasteId = searchParams.get('id');
    if (pasteId) {
      setId(pasteId);
      // Auto-fetch if ID is provided in URL
      handleViewPaste(pasteId);
    }
  }, [searchParams]);

  const handleViewPaste = useCallback(
    async (pasteId?: string) => {
      const targetId = pasteId || id;
      if (!targetId.trim()) {
        setError('Please enter a paste ID');
        return;
      }

      console.log('Fetching paste with ID:', targetId);

      setLoading(true);
      setError('');
      setPaste(null);

      try {
        const response = await getPaste(targetId);
        console.log('Paste fetch response(page):', response);
        setPaste(response);

        // if (response && response.id && response.text) {
        //   console.log('hit if statement for response1');
        //   setPaste(response);
        //   console.log('hit if statement for response2');
        // } else {
        //   setError('Failed to fetch paste - invalid response format');
        // }
      } catch (err) {
        console.error('Paste fetch failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch paste');
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  const handleView = () => {
    handleViewPaste();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleView();
    }
  };

  const handleClear = () => {
    setId('');
    setPaste(null);
    setError('');
  };

  const handleCopy = async () => {
    if (paste?.text) {
      try {
        await navigator.clipboard.writeText(paste.text);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && paste) {
      try {
        await navigator.share({
          title: 'Shared Paste',
          text: paste.text.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const handleDownload = () => {
    if (paste?.text) {
      const blob = new Blob([paste.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paste_${id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <Meta title="View Paste - PasteBin" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              <Visibility sx={{ mr: 1, verticalAlign: 'middle' }} />
              View Paste
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter a paste ID to view its content
            </Typography>
          </Box>

          {/* Input Section */}
          <Box sx={{ mb: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Paste ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter paste ID (e.g., 686e00756dfea8ec)"
                fullWidth
                variant="outlined"
                disabled={loading}
              />
              <Button
                variant="contained"
                onClick={handleView}
                disabled={loading || !id.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <Visibility />}
                sx={{ minWidth: 140 }}
              >
                {loading ? 'Loading...' : 'View Paste'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClear}
                startIcon={<Clear />}
                disabled={loading}
              >
                Clear
              </Button>
            </Stack>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Paste Content */}
          {paste && (
            <Box>
              {/* Paste Info */}
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack direction="row" spacing={1}>
                  <Typography variant="h6">Paste Content</Typography>
                  {paste.createdAt && (
                    <Chip
                      label={`Created: ${new Date(paste.createdAt).toLocaleDateString()}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {paste.expiresAt && (
                    <Chip
                      label={`Expires: ${new Date(paste.expiresAt).toLocaleDateString()}`}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Stack>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Copy to Clipboard">
                    <IconButton onClick={handleCopy} size="small">
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton onClick={handleDownload} size="small">
                      <Download />
                    </IconButton>
                  </Tooltip>
                  {'share' in navigator && (
                    <Tooltip title="Share">
                      <IconButton onClick={handleShare} size="small">
                        <Share />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Box>

              {/* Content Display */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                  maxHeight: '500px',
                  overflow: 'auto',
                }}
              >
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {paste.text}
                </Typography>
              </Paper>

              {/* Character Count */}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Characters: {paste.text.length}
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
}

export default GetPaste;
