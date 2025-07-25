import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 40 
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={3}
    >
      <CircularProgress 
        size={size} 
        sx={{ 
          mb: 2,
          color: 'primary.main'
        }} 
      />
      <Typography 
        variant="body2" 
        color="text.secondary"
        textAlign="center"
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;