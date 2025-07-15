import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Schedule as ScheduleIcon,
  Mouse as ClickIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { ShortenedUrl } from '../../utils/urlShortener';
import { logger } from '../../utils/logger';

interface UrlResultsProps {
  urls: ShortenedUrl[];
  onUrlClick: (shortCode: string) => void;
}

const UrlResults: React.FC<UrlResultsProps> = ({ urls, onUrlClick }) => {
  const [copySnackbar, setCopySnackbar] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: '' });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getShortUrl = (shortCode: string) => {
    return `${window.location.origin}/${shortCode}`;
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySnackbar({ open: true, message: `${label} copied to clipboard!` });
      logger.info(`Copied to clipboard: ${label}`, 'URL_RESULTS', { text });
    } catch (error) {
      setCopySnackbar({ open: true, message: 'Failed to copy to clipboard' });
      logger.error('Failed to copy to clipboard', 'URL_RESULTS', error);
    }
  };

  const handleUrlClick = (shortCode: string) => {
    logger.info(`User clicked on short URL: ${shortCode}`, 'URL_RESULTS');
    onUrlClick(shortCode);
  };

  const handleShare = async (url: ShortenedUrl) => {
    const shortUrl = getShortUrl(url.shortCode);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shortened URL',
          text: `Check out this link: ${url.originalUrl}`,
          url: shortUrl,
        });
        logger.info('Shared URL using Web Share API', 'URL_RESULTS', { shortCode: url.shortCode });
      } catch (error) {
        logger.debug('Web share cancelled or failed', 'URL_RESULTS', error);
      }
    } else {
      // Fallback to copy
      handleCopy(shortUrl, 'Short URL');
    }
  };

  if (urls.length === 0) {
    return null;
  }

  return (
    <>
      <Card elevation={2} sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Your Shortened URLs
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {urls.length} URL{urls.length > 1 ? 's' : ''} created successfully
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {urls.map((url, index) => (
              <Paper
                key={url.id}
                elevation={1}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: url.isExpired ? 'error.light' : 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: url.isExpired ? 'error.main' : 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                {/* Top row with URLs and actions */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'center' },
                  gap: 2,
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`#${index + 1}`}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem', mb: 0.5 }}
                    >
                      Original URL:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        wordBreak: 'break-all',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {url.originalUrl}
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 200 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem', mb: 0.5 }}
                    >
                      Short URL:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        color="primary.main"
                        sx={{
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                          wordBreak: 'break-all',
                        }}
                        onClick={() => handleUrlClick(url.shortCode)}
                      >
                        {getShortUrl(url.shortCode)}
                      </Typography>
                      <Tooltip title="Copy short URL">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(getShortUrl(url.shortCode), 'Short URL')}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Tooltip title="Visit original URL">
                      <IconButton
                        size="small"
                        href={url.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share URL">
                      <IconButton
                        size="small"
                        onClick={() => handleShare(url)}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Bottom row with metadata */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 2,
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Expires in: 
                      </Typography>
                      <Chip
                        label={getTimeRemaining(url.expiresAt)}
                        size="small"
                        color={url.isExpired ? 'error' : 'default'}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ClickIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Clicks:
                      </Typography>
                      <Chip
                        label={url.clicks.length}
                        size="small"
                        color="info"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                      Created: {formatDate(url.createdAt)}
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => window.open(`/analytics?url=${url.shortCode}`, '_blank')}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    View Stats
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={copySnackbar.open}
        autoHideDuration={3000}
        onClose={() => setCopySnackbar({ ...copySnackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setCopySnackbar({ ...copySnackbar, open: false })} 
          severity="success"
        >
          {copySnackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UrlResults;