import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import {
  Link as LinkIcon,
  Analytics,
  BugReport,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { logger } from '../../utils/logger';

const Header: React.FC = () => {
  const location = useLocation();

  const handleLogoClick = () => {
    logger.info('Navigation to home page', 'NAVIGATION');
  };

  const handleAnalyticsClick = () => {
    logger.info('Navigation to analytics page', 'NAVIGATION');
  };

  const handleLogsClick = () => {
    logger.info('Navigation to logs page', 'NAVIGATION');
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box
          component={Link}
          to="/"
          onClick={handleLogoClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': {
              opacity: 0.9,
            },
          }}
        >
          <LinkIcon sx={{ mr: 1, fontSize: '1.75rem' }} />
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            QuickLink
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            to="/analytics"
            onClick={handleAnalyticsClick}
            color="inherit"
            startIcon={<Analytics />}
            sx={{
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
            variant={location.pathname === '/analytics' ? 'outlined' : 'text'}
          >
            Analytics
          </Button>
          
          <IconButton
            component={Link}
            to="/logs"
            onClick={handleLogsClick}
            color="inherit"
            title="System Logs"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <BugReport />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;