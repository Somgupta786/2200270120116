import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Link as LinkIcon,
  Timer as TimerIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { CreateUrlRequest } from '../../utils/urlShortener';
import { logger, logValidation } from '../../utils/logger';

interface UrlEntry {
  id: string;
  originalUrl: string;
  validityMinutes: string;
  customShortCode: string;
  useCustomCode: boolean;
}

interface UrlShortenerFormProps {
  onSubmit: (requests: CreateUrlRequest[]) => void;
  isLoading: boolean;
}

const UrlShortenerForm: React.FC<UrlShortenerFormProps> = ({ onSubmit, isLoading }) => {
  const [urls, setUrls] = useState<UrlEntry[]>([
    {
      id: '1',
      originalUrl: '',
      validityMinutes: '30',
      customShortCode: '',
      useCustomCode: false,
    },
  ]);

  const addUrlEntry = () => {
    if (urls.length < 5) {
      const newEntry: UrlEntry = {
        id: Date.now().toString(),
        originalUrl: '',
        validityMinutes: '30',
        customShortCode: '',
        useCustomCode: false,
      };
      setUrls([...urls, newEntry]);
      logger.info(`Added new URL entry. Total entries: ${urls.length + 1}`, 'URL_FORM');
    }
  };

  const removeUrlEntry = (id: string) => {
    if (urls.length > 1) {
      setUrls(urls.filter(url => url.id !== id));
      logger.info(`Removed URL entry. Remaining entries: ${urls.length - 1}`, 'URL_FORM');
    }
  };

  const updateUrlEntry = (id: string, field: keyof UrlEntry, value: string | boolean) => {
    setUrls(urls.map(url => 
      url.id === id ? { ...url, [field]: value } : url
    ));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    const usedShortCodes = new Set<string>();

    urls.forEach((url, index) => {
      // Validate URL
      if (!url.originalUrl.trim()) {
        errors.push(`URL ${index + 1}: Original URL is required`);
      } else {
        try {
          const urlObj = new URL(url.originalUrl);
          if (!['http:', 'https:'].includes(urlObj.protocol)) {
            errors.push(`URL ${index + 1}: Only HTTP and HTTPS URLs are allowed`);
          }
          logValidation(`URL ${index + 1} format`, url.originalUrl, true);
        } catch {
          errors.push(`URL ${index + 1}: Invalid URL format`);
          logValidation(`URL ${index + 1} format`, url.originalUrl, false, 'Invalid URL format');
        }
      }

      // Validate validity
      const validity = parseInt(url.validityMinutes);
      if (isNaN(validity) || validity <= 0) {
        errors.push(`URL ${index + 1}: Validity must be a positive number`);
        logValidation(`URL ${index + 1} validity`, url.validityMinutes, false, 'Must be positive integer');
      } else {
        logValidation(`URL ${index + 1} validity`, url.validityMinutes, true);
      }

      // Validate custom shortcode
      if (url.useCustomCode) {
        if (!url.customShortCode.trim()) {
          errors.push(`URL ${index + 1}: Custom shortcode is required when enabled`);
        } else {
          const code = url.customShortCode.trim();
          if (code.length < 3 || code.length > 20) {
            errors.push(`URL ${index + 1}: Custom shortcode must be 3-20 characters`);
          } else if (!/^[a-zA-Z0-9]+$/.test(code)) {
            errors.push(`URL ${index + 1}: Custom shortcode must be alphanumeric`);
          } else if (usedShortCodes.has(code)) {
            errors.push(`URL ${index + 1}: Custom shortcode must be unique within this form`);
          } else {
            usedShortCodes.add(code);
            logValidation(`URL ${index + 1} shortcode`, code, true);
          }
        }
      }
    });

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      logger.warn('Form validation failed', 'URL_FORM', { errors });
      // In a real app, you'd show these errors to the user
      return;
    }

    const requests: CreateUrlRequest[] = urls.map(url => ({
      originalUrl: url.originalUrl.trim(),
      validityMinutes: parseInt(url.validityMinutes),
      customShortCode: url.useCustomCode ? url.customShortCode.trim() : undefined,
    }));

    logger.info('Form submitted with valid data', 'URL_FORM', { 
      urlCount: requests.length,
      hasCustomCodes: requests.some(r => r.customShortCode)
    });

    onSubmit(requests);
  };

  return (
    <Card elevation={2}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            URL Shortener
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create up to 5 shortened URLs at once. Each URL can have custom validity and shortcode.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            {urls.map((url, index) => (
              <Accordion 
                key={url.id} 
                defaultExpanded={index === 0}
                sx={{ 
                  mb: 2,
                  '&:before': { display: 'none' },
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    backgroundColor: 'grey.50',
                    '&:hover': { backgroundColor: 'grey.100' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Chip 
                      label={`URL ${index + 1}`} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {url.originalUrl || 'Enter URL...'}
                    </Typography>
                    {urls.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUrlEntry(url.id);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Original URL"
                      placeholder="https://example.com/very-long-url"
                      value={url.originalUrl}
                      onChange={(e) => updateUrlEntry(url.id, 'originalUrl', e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      helperText="Enter a valid HTTP or HTTPS URL"
                    />

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Validity (minutes)"
                        type="number"
                        value={url.validityMinutes}
                        onChange={(e) => updateUrlEntry(url.id, 'validityMinutes', e.target.value)}
                        required
                        inputProps={{ min: 1 }}
                        InputProps={{
                          startAdornment: <TimerIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        helperText="Default: 30 minutes"
                      />

                      <Box sx={{ flex: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={url.useCustomCode}
                              onChange={(e) => updateUrlEntry(url.id, 'useCustomCode', e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2">Custom Shortcode</Typography>
                              <Tooltip title="3-20 alphanumeric characters" placement="top">
                                <InfoIcon sx={{ ml: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                              </Tooltip>
                            </Box>
                          }
                        />
                        {url.useCustomCode && (
                          <TextField
                            fullWidth
                            label="Custom Shortcode"
                            placeholder="mycode123"
                            value={url.customShortCode}
                            onChange={(e) => updateUrlEntry(url.id, 'customShortCode', e.target.value)}
                            required={url.useCustomCode}
                            sx={{ mt: 1 }}
                            InputProps={{
                              startAdornment: <CodeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            helperText="3-20 alphanumeric characters, must be unique"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addUrlEntry}
              disabled={urls.length >= 5}
              sx={{ fontWeight: 600 }}
            >
              Add URL ({urls.length}/5)
            </Button>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ 
                fontWeight: 600,
                px: 4,
                py: 1.5,
              }}
            >
              {isLoading ? 'Creating...' : `Create ${urls.length} Short URL${urls.length > 1 ? 's' : ''}`}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default UrlShortenerForm;