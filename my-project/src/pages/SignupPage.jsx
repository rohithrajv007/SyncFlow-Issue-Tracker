import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Alert, Grid, Link } from '@mui/material';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/signup', { name, email, password });
      navigate('/login'); // Redirect to login after successful signup
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up.');
    }
  };

  return (
    <AuthLayout title="Sign Up">
      {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
      <form onSubmit={handleSignup} noValidate>
        <TextField margin="normal" required fullWidth label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <TextField margin="normal" required fullWidth label="Email Address" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField margin="normal" required fullWidth name="password" label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Sign Up
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;