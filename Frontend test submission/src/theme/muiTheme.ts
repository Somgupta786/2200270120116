import { createTheme } from '@mui/material/styles';

// Create Material UI theme with our design system colors
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(210, 100%, 60%)', // --primary
      dark: 'hsl(210, 100%, 45%)', // --primary-dark
      light: 'hsl(210, 100%, 75%)', // --primary-light
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'hsl(280, 87%, 65%)', // --secondary
      dark: 'hsl(280, 87%, 50%)', // --secondary-dark
      light: 'hsl(280, 87%, 80%)', // --secondary-light
      contrastText: '#ffffff',
    },
    success: {
      main: 'hsl(120, 60%, 50%)',
      light: 'hsl(120, 60%, 95%)',
    },
    error: {
      main: 'hsl(0, 65%, 55%)',
      light: 'hsl(0, 65%, 95%)',
    },
    warning: {
      main: 'hsl(45, 100%, 50%)',
      light: 'hsl(45, 100%, 95%)',
    },
    info: {
      main: 'hsl(200, 100%, 60%)',
      light: 'hsl(200, 100%, 95%)',
    },
    background: {
      default: 'hsl(0, 0%, 98%)', // --background
      paper: 'hsl(0, 0%, 100%)', // --surface
    },
    text: {
      primary: 'hsl(220, 25%, 15%)', // --text-primary
      secondary: 'hsl(220, 15%, 45%)', // --text-secondary
      disabled: 'hsl(220, 10%, 70%)', // --text-disabled
    },
    divider: 'hsl(220, 13%, 91%)', // --divider
  },
  shape: {
    borderRadius: 8, // --radius
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, hsl(210, 100%, 60%), hsl(280, 87%, 65%))',
          '&:hover': {
            background: 'linear-gradient(135deg, hsl(210, 100%, 55%), hsl(280, 87%, 60%))',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px)',
              boxShadow: '0 0 0 3px hsl(210, 100%, 60%, 0.3)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, hsl(210, 100%, 60%), hsl(280, 87%, 65%))',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});