import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import useOrientation from '@/hooks/useOrientation';
import { Button, Typography, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import pastebin-related icons/logos
import pasteIcon from './logos/mui.svg'; // You'll need to add this
import shareIcon from './logos/pwa.svg'; // You'll need to add this
import codeIcon from './logos/react_ed.svg'; // You'll need to add this

function Home() {
  const isPortrait = useOrientation();
  const navigate = useNavigate();

  const handleCreatePaste = () => {
    navigate('/create-paste');
  };

  const handleViewPaste = () => {
    navigate('/get-paste');
  };

  return (
    <>
      <Meta title="Pastebin - Share Code & Text" />
      <FullSizeCenteredFlexBox flexDirection="column">
        <Container maxWidth="md" sx={{ textAlign: 'center', py: 4 }}>
          {/* Header Section */}
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            PasteBin
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 4 }}
          >
            Share code snippets, text, and collaborate instantly
          </Typography>

          {/* Feature Icons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: isPortrait ? 'column' : 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              mb: 6,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={pasteIcon}
                alt="Create Paste"
                sx={{ width: 64, height: 64, mb: 1 }}
              />
              <Typography variant="body1" color="text.secondary">
                Create Paste
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={shareIcon}
                alt="Share Instantly"
                sx={{ width: 64, height: 64, mb: 1 }}
              />
              <Typography variant="body1" color="text.secondary">
                Share Instantly
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={codeIcon}
                alt="Code Highlighting"
                sx={{ width: 64, height: 64, mb: 1 }}
              />
              <Typography variant="body1" color="text.secondary">
                Code Highlighting
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: isPortrait ? 'column' : 'row',
              gap: 2,
              justifyContent: 'center',
              mb: 4,
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleCreatePaste}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
              }}
            >
              Create New Paste
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleViewPaste}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
              }}
            >
              View Existing Paste
            </Button>
          </Box>

          {/* Features List */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: isPortrait ? '1fr' : 'repeat(2, 1fr)',
                gap: 2,
                mt: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                ✓ Syntax highlighting for multiple languages
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✓ Instant sharing with unique links
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✓ No registration required
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✓ Progressive Web App support
              </Typography>
            </Box>
          </Box>
        </Container>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default Home;
