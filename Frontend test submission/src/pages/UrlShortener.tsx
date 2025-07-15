import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme/muiTheme';
import Header from '../components/layout/Header';
import UrlShortenerForm from '../components/url-shortener/UrlShortenerForm';
import UrlResults from '../components/url-shortener/UrlResults';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { 
  urlShortenerService, 
  CreateUrlRequest, 
  ShortenedUrl 
} from '../utils/urlShortener';
import { logger } from '../utils/logger';

const UrlShortener: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Load existing URLs on component mount
    loadExistingUrls();
    
    // Clean up expired URLs
    urlShortenerService.cleanupExpiredUrls();
    
    logger.info('URL Shortener page loaded', 'PAGE_LOAD');
  }, []);

  const loadExistingUrls = () => {
    try {
      const existingUrls = urlShortenerService.getAllUrls();
      setUrls(existingUrls);
      logger.info(`Loaded ${existingUrls.length} existing URLs`, 'DATA_LOAD');
    } catch (error) {
      logger.error('Failed to load existing URLs', 'DATA_LOAD', error);
    }
  };

  const handleSubmit = async (requests: CreateUrlRequest[]) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      logger.info(`Processing ${requests.length} URL shortening requests`, 'URL_CREATION');
      
      const results: ShortenedUrl[] = [];
      const errors: string[] = [];

      for (const request of requests) {
        const result = urlShortenerService.createShortenedUrl(request);
        
        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(result.error || 'Unknown error occurred');
        }
      }

      if (errors.length > 0) {
        const errorMessage = `Some URLs failed to create: ${errors.join(', ')}`;
        setError(errorMessage);
        logger.warn('Partial URL creation failure', 'URL_CREATION', { errors, successCount: results.length });
      }

      if (results.length > 0) {
        // Add new URLs to the beginning of the list
        setUrls(prevUrls => [...results, ...prevUrls]);
        setSuccess(`Successfully created ${results.length} shortened URL${results.length > 1 ? 's' : ''}!`);
        logger.info(`Successfully created ${results.length} URLs`, 'URL_CREATION', { 
          createdUrls: results.map(url => url.shortCode) 
        });
      }

    } catch (error) {
      const errorMessage = 'An unexpected error occurred while creating URLs';
      setError(errorMessage);
      logger.error('URL creation failed', 'URL_CREATION', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlClick = (shortCode: string) => {
    try {
      const result = urlShortenerService.accessShortenedUrl(shortCode, 'results_page');
      
      if (result.success && result.originalUrl) {
        // Update the click count in the local state
        setUrls(prevUrls => 
          prevUrls.map(url => 
            url.shortCode === shortCode 
              ? { ...url, clicks: [...url.clicks, {
                  timestamp: new Date().toISOString(),
                  source: 'results_page',
                  location: 'Unknown',
                  userAgent: navigator.userAgent
                }]}
              : url
          )
        );
        
        // Redirect to the original URL
        window.open(result.originalUrl, '_blank', 'noopener,noreferrer');
        logger.info(`Redirected to original URL: ${result.originalUrl}`, 'URL_REDIRECT');
      } else {
        setError(result.error || 'Failed to access URL');
      }
    } catch (error) {
      setError('An error occurred while accessing the URL');
      logger.error('URL access failed', 'URL_REDIRECT', error);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadExistingUrls();
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              textAlign: 'center',
              background: 'linear-gradient(135deg, hsl(210, 100%, 60%), hsl(280, 87%, 65%))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            QuickLink URL Shortener
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}
          >
            Transform long URLs into short, shareable links with custom codes, expiration dates, and detailed analytics
          </Typography>
        </Box>

        {success && (
          <Alert 
            severity="success" 
            onClose={handleCloseSuccess}
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        {error && (
          <ErrorDisplay
            title="Operation Failed"
            message={error}
            onRetry={handleRetry}
            severity="error"
          />
        )}

        {isLoading && (
          <LoadingSpinner 
            message="Creating your shortened URLs..." 
            size={50}
          />
        )}

        <UrlShortenerForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        <UrlResults 
          urls={urls}
          onUrlClick={handleUrlClick}
        />
      </Container>
    </ThemeProvider>
  );
};

export default UrlShortener;