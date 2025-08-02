import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Alert, Link, Grid } from '@mui/material';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('OTP sent! Please check your email.');
      // Navigate to verify OTP page, passing email in state or query
      setTimeout(() => navigate(`/verify-otp?email=${email}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    }
  };

  return (
    <AuthLayout title="Forgot Password">
      {message && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
      <form onSubmit={handleForgotPassword} noValidate>
        <TextField margin="normal" required fullWidth label="Email Address" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Send Reset OTP
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Sign In
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;