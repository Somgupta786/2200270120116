import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Button, 
  Typography,
  Paper
} from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';
import { logger } from '../../utils/logger';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  severity?: 'error' | 'warning' | 'info';
  details?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Error',
  message,
  onRetry,
  severity = 'error',
  details
}) => {
  const handleRetry = () => {
    logger.info('User triggered retry action', 'ERROR_DISPLAY');
    onRetry?.();
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3, 
        m: 2,
        border: severity === 'error' ? '1px solid' : 'none',
        borderColor: 'error.light',
      }}
    >
      <Alert 
        severity={severity}
        icon={<ErrorIcon />}
        sx={{ mb: onRetry || details ? 2 : 0 }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>
          {title}
        </AlertTitle>
        <Typography variant="body2">
          {message}
        </Typography>
      </Alert>

      {details && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontFamily: 'monospace' }}
          >
            {details}
          </Typography>
        </Box>
      )}

      {onRetry && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color={severity}
            startIcon={<Refresh />}
            onClick={handleRetry}
            sx={{ fontWeight: 600 }}
          >
            Try Again
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ErrorDisplay;