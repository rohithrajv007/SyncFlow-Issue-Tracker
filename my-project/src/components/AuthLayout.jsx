import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { keyframes } from '@emotion/react';

// A subtle animation for the gradient background
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AuthLayout = ({ title, children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #2196F3 30%, #FFC107 90%)',
        backgroundSize: '200% 200%',
        animation: `${gradientAnimation} 15s ease infinite`,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <LockOutlinedIcon sx={{ m: 1, bgcolor: 'primary.main', color: 'white', borderRadius: '50%', p: 1 }} />
          <Typography component="h1" variant="h5">
            {title}
          </Typography>
          <Box sx={{ mt: 1, width: '100%' }}>
            {children}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;