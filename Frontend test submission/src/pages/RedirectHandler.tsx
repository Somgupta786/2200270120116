import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Launch as LaunchIcon, 
  Error as ErrorIcon,
  Schedule as ScheduleIcon 
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme/muiTheme';
import { urlShortenerService } from '../utils/urlShortener';
import { logger } from '../utils/logger';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code');
      setIsLoading(false);
      return;
    }

    handleRedirect(shortCode);
  }, [shortCode]);

  useEffect(() => {
    if (originalUrl && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (originalUrl && countdown === 0) {
      // Redirect to the original URL
      window.location.href = originalUrl;
    }
  }, [originalUrl, countdown]);

  const handleRedirect = async (code: string) => {
    try {
      logger.info(`Attempting to redirect for shortcode: ${code}`, 'REDIRECT_HANDLER');
      
      const result = urlShortenerService.accessShortenedUrl(code, 'direct_link');
      
      if (result.success && result.originalUrl) {
        setOriginalUrl(result.originalUrl);
        logger.info(`Redirect successful for ${code} -> ${result.originalUrl}`, 'REDIRECT_HANDLER');
      } else {
        setError(result.error || 'Failed to access URL');
        logger.warn(`Redirect failed for ${code}: ${result.error}`, 'REDIRECT_HANDLER');
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      logger.error('Redirect handling failed', 'REDIRECT_HANDLER', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRedirect = () => {
    if (originalUrl) {
      window.location.href = originalUrl;
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (!shortCode) {
    return <Navigate to="/404" replace />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, hsl(210, 100%, 60%), hsl(280, 87%, 65%))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4
            }}
          >
            QuickLink
          </Typography>

          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              {isLoading ? (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={60} sx={{ mb: 3 }} />
                  <Typography variant="h5" gutterBottom>
                    Processing your link...
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Verifying short code: <strong>{shortCode}</strong>
                  </Typography>
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: 'center' }}>
                  <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h5" gutterBottom color="error">
                    Link Not Found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {error}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    The short code <Chip label={shortCode} size="small" sx={{ mx: 0.5 }} /> 
                    could not be found or may have expired.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleGoHome}
                    size="large"
                    sx={{ fontWeight: 600 }}
                  >
                    Go to Homepage
                  </Button>
                </Box>
              ) : originalUrl ? (
                <Box sx={{ textAlign: 'center' }}>
                  <LaunchIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Redirecting...
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      You will be redirected to:
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        wordBreak: 'break-all',
                        backgroundColor: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        fontFamily: 'monospace'
                      }}
                    >
                      {originalUrl}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      {countdown}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      seconds remaining
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button 
                      variant="contained" 
                      onClick={handleManualRedirect}
                      startIcon={<LaunchIcon />}
                      size="large"
                      sx={{ fontWeight: 600 }}
                    >
                      Go Now
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      onClick={handleGoHome}
                      size="large"
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : null}
            </CardContent>
          </Card>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 3, textAlign: 'center' }}
          >
            Powered by QuickLink URL Shortener
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default RedirectHandler;