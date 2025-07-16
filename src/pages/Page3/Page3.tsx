import React, { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ContentCopy, Delete, Visibility, Search, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import Meta from '@/components/Meta';
import {
  getRecentPastesUnified,
  deletePaste,
  exportUserPasteIds,
  importUserPasteIds,
  type StoredPaste,
} from '@/api/pasteService';
import useOrientation from '@/hooks/useOrientation';
import useNotifications from '@/store/notifications';

function Page3() {
  const [pastes, setPastes] = useState<StoredPaste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaste, setSelectedPaste] = useState<StoredPaste | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const navigate = useNavigate();
  const isPortrait = useOrientation();
  const [, notificationsActions] = useNotifications();

  useEffect(() => {
    loadPastes();
  }, []);

  const loadPastes = async () => {
    setLoading(true);
    setError('');
    try {
      const recentPastes = await getRecentPastesUnified();
      setPastes(recentPastes);
    } catch (error) {
      console.error('Error loading pastes:', error);
      setError('Failed to load pastes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPasteContent = async (pasteText: string) => {
    try {
      if (!pasteText) return;
      await navigator.clipboard.writeText(pasteText);
      notificationsActions.push({
        message: 'Paste content copied to clipboard!',
        options: {
          variant: 'success',
          autoHideDuration: 3000,
        },
      });
    } catch (error) {
      console.error('Failed to copy paste content:', error);
      notificationsActions.push({
        message: 'Failed to copy paste content',
        options: {
          variant: 'error',
          autoHideDuration: 3000,
        },
      });
    }
  };

  const handleDeletePaste = async (pasteId: string) => {
    if (!pasteId) return;

    try {
      // Call backend API to delete the paste
      await deletePaste(pasteId);

      // Remove from local state
      setPastes(pastes.filter((paste) => paste.id !== pasteId));

      notificationsActions.push({
        message: 'Paste deleted successfully!',
        options: {
          variant: 'info',
          autoHideDuration: 3000,
        },
      });
    } catch (error) {
      console.error('Failed to delete paste:', error);
      notificationsActions.push({
        message: error instanceof Error ? error.message : 'Failed to delete paste',
        options: {
          variant: 'error',
          autoHideDuration: 3000,
        },
      });
    }
  };

  const handlePreviewPaste = (paste: StoredPaste) => {
    setSelectedPaste(paste);
    setPreviewOpen(true);
  };

  const handleViewPaste = (pasteId: string) => {
    if (!pasteId) return;
    navigate(`/get-paste?id=${pasteId}`);
  };

  const handleExportPasteIds = () => {
    const exportedData = exportUserPasteIds();
    navigator.clipboard.writeText(exportedData);
    notificationsActions.push({
      message: 'Paste IDs exported to clipboard!',
      options: {
        variant: 'success',
        autoHideDuration: 3000,
      },
    });
  };

  const handleImportPasteIds = () => {
    if (importData.trim()) {
      try {
        importUserPasteIds(importData);
        setImportData('');
        setImportExportOpen(false);
        loadPastes(); // Refresh the list
        notificationsActions.push({
          message: 'Paste IDs imported successfully!',
          options: {
            variant: 'success',
            autoHideDuration: 3000,
          },
        });
      } catch (error) {
        console.error('Failed to import paste IDs:', error);
        notificationsActions.push({
          message: 'Failed to import paste IDs',
          options: {
            variant: 'error',
            autoHideDuration: 3000,
          },
        });
      }
    }
  };

  const filteredPastes = pastes.filter(
    (paste) =>
      (paste.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      paste.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paste.id?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string | undefined, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <Meta title="All Pastes - Last 24 Hours" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 3,
          }}
        >
          All Pastes
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
          Showing all pastes from the last 24 hours across all devices
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          ✓ Pastes created on any device will appear here automatically
        </Typography>

        {/* Search and Filter Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isPortrait ? 'column' : 'row',
            gap: 2,
            mb: 4,
            alignItems: 'center',
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Search pastes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadPastes}
            sx={{ minWidth: 120 }}
          >
            Refresh
          </Button>
          <Button variant="outlined" onClick={handleExportPasteIds} sx={{ minWidth: 120 }}>
            Export IDs
          </Button>
          <Button
            variant="outlined"
            onClick={() => setImportExportOpen(true)}
            sx={{ minWidth: 120 }}
          >
            Import IDs
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredPastes.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center' }}>
            {searchTerm
              ? 'No pastes found matching your search.'
              : 'No pastes found in the last 24 hours. Create your first paste!'}
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {filteredPastes.map((paste) => (
              <Card
                key={paste.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        color: 'primary.main',
                      }}
                    >
                      {paste.title || `Paste ${paste.id?.substring(0, 8) || 'Unknown'}`}
                    </Typography>
                    {paste.language && (
                      <Chip
                        label={paste.language}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontFamily: 'monospace' }}
                  >
                    {truncateText(paste.text)}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Created: {formatDate(paste.createdAt)}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    ID: {paste.id || 'Unknown'}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    {/* <Tooltip title="Copy Paste ID">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyPaste(paste.id || '')}
                        color="secondary"
                      >
                        <FileCopy fontSize="small" />
                      </IconButton>
                    </Tooltip> */}
                    <Tooltip title="Copy Paste Content">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyPasteContent(paste.text || '')}
                        color="primary"
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Preview">
                      <IconButton
                        size="small"
                        onClick={() => handlePreviewPaste(paste)}
                        color="primary"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete from History">
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePaste(paste.id || '')}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleViewPaste(paste.id || '')}
                  >
                    View
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedPaste?.title || `Paste ${selectedPaste?.id.substring(0, 8)}`}
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="body2"
              component="pre"
              sx={{
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                p: 2,
                borderRadius: 1,
                maxHeight: '400px',
                overflow: 'auto',
              }}
            >
              {selectedPaste?.text}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button
              onClick={() => {
                if (selectedPaste?.text) {
                  navigator.clipboard.writeText(selectedPaste.text);
                  notificationsActions.push({
                    message: 'Paste content copied to clipboard!',
                    options: {
                      variant: 'success',
                      autoHideDuration: 3000,
                    },
                  });
                }
              }}
              startIcon={<ContentCopy />}
            >
              Copy
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (selectedPaste?.id) {
                  handleViewPaste(selectedPaste.id);
                }
              }}
            >
              View Full
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import/Export Dialog */}
        <Dialog
          open={importExportOpen}
          onClose={() => setImportExportOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Import Paste IDs</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Paste the exported paste IDs from another device to sync your pastes.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Paste IDs (JSON format)"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='["paste-id-1", "paste-id-2", ...]'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportExportOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleImportPasteIds}
              disabled={!importData.trim()}
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default Page3;
