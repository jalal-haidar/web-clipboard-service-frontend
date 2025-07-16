import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Container,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ContentCopy, Send, Code, Clear, Share } from '@mui/icons-material';

import Meta from '@/components/Meta';
import { createPaste } from '@/api/pasteService';
import useNotifications from '@/store/notifications';

// Language options for syntax highlighting
const languages = [
  { value: 'text', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'bash', label: 'Bash' },
];

// Expiration options
const expirationOptions = [
  { value: 'never', label: 'Never' },
  { value: '10', label: '10 Minutes' },
  { value: '60', label: '1 Hour' },
  { value: '1440', label: '1 Day' },
  { value: '10080', label: '1 Week' },
  { value: '43200', label: '1 Month' },
];

function CreatePaste() {
  const [text, setText] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [language, setLanguage] = useState<string>('text');
  const [expiration, setExpiration] = useState<string>('never');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [pasteId, setPasteId] = useState<string>('');
  const [, notificationsActions] = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Please enter some text to create a paste');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await createPaste(text, {
        title: title.trim() || undefined,
        language,
        expiration: expiration === 'never' ? undefined : parseInt(expiration),
      });

      console.log('Full response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Paste created successfully (PastePage):', response);

      if (response && response.id) {
        setPasteId(response.id);
        setSuccess('Paste created successfully!');

        // Optional: Clear form after successful creation
        // setText('');
        // setTitle('');
        // setLanguage('text');
        // setExpiration('never');
      } else {
        // setError(response.message || 'Failed to create paste');
        setError('Failed to create paste');
      }
    } catch (err) {
      console.error('Paste creation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setTitle('');
    setLanguage('text');
    setExpiration('never');
    setError('');
    setSuccess('');
    setPasteId('');

    notificationsActions.push({
      message: 'Form cleared successfully!',
      options: {
        variant: 'info',
        autoHideDuration: 2000,
      },
    });
  };

  // Check if Web Share API is supported
  const isWebShareSupported = (): boolean => {
    return 'share' in navigator && typeof navigator.share === 'function';
  };

  const handleCopyLink = async () => {
    if (!pasteId) return;

    try {
      const link = `${window.location.origin}/paste/${pasteId}`;
      await navigator.clipboard.writeText(link);
      notificationsActions.push({
        message: 'Link copied to clipboard!',
        options: {
          variant: 'success',
          autoHideDuration: 3000,
        },
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      notificationsActions.push({
        message: 'Failed to copy link to clipboard',
        options: {
          variant: 'error',
          autoHideDuration: 3000,
        },
      });
    }
  };

  const handleShare = async () => {
    if (!pasteId) return;

    const shareData = {
      title: title || 'Shared Paste',
      text: 'Check out this paste',
      url: `${window.location.origin}/paste/${pasteId}`,
    };

    if (isWebShareSupported()) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Share failed:', err);
          // Fallback to clipboard
          handleCopyLink();
        }
        // User cancelled sharing - do nothing
      }
    } else {
      // Fallback to clipboard for unsupported browsers
      handleCopyLink();
    }
  };

  return (
    <>
      <Meta title="Create Paste - PasteBin" />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
              Create New Paste
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Share your code snippets and text with others
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Title Field */}
            <TextField
              label="Title (Optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              placeholder="Give your paste a name..."
            />

            {/* Settings Row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  label="Language"
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                <InputLabel>Expiration</InputLabel>
                <Select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  label="Expiration"
                >
                  {expirationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Main Text Area */}
            <TextField
              label="Paste Content"
              value={text}
              onChange={(e) => setText(e.target.value)}
              multiline
              rows={20}
              fullWidth
              variant="outlined"
              placeholder="Paste your code or text here..."
              sx={{
                mb: 2,
                '& .MuiInputBase-input': {
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '14px',
                },
              }}
              required
            />

            {/* Character Count */}
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                Characters: {text.length}
              </Typography>

              <Stack direction="row" spacing={1}>
                {language !== 'text' && (
                  <Chip
                    label={languages.find((l) => l.value === language)?.label}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {expiration !== 'never' && (
                  <Chip
                    label={`Expires: ${expirationOptions.find((e) => e.value === expiration)
                      ?.label}`}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>

            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                sx={{ mb: 2 }}
                action={
                  pasteId && (
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Copy Link">
                        <IconButton size="small" onClick={handleCopyLink}>
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                      {isWebShareSupported() && (
                        <Tooltip title="Share">
                          <IconButton size="small" onClick={handleShare}>
                            <Share />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  )
                }
              >
                {success}
                {pasteId && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Paste ID: <strong>{pasteId}</strong>
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !text.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                sx={{ px: 4 }}
              >
                {loading ? 'Creating...' : 'Create Paste'}
              </Button>

              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={handleClear}
                startIcon={<Clear />}
                disabled={loading}
              >
                Clear
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default CreatePaste;
