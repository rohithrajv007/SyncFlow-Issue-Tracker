import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Alert, Link, Grid } from '@mui/material';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      setError("No email address found. Please start the password reset process again.");
    }
  }, [email]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp, newPassword });
      alert('Password reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP.');
    }
  };

  return (
    <AuthLayout title="Verify OTP">
      {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
      <form onSubmit={handleVerifyOtp} noValidate>
        <TextField margin="normal" required fullWidth label="OTP from Email" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} autoFocus />
        <TextField margin="normal" required fullWidth name="newPassword" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={!email}>
          Reset Password
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

export default VerifyOtpPage;