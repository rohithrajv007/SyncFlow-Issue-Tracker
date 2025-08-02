import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Alert, Grid, Link } from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout'; // Import our new layout

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      auth.login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login.');
    }
  };

  return (
    <AuthLayout title="Sign In">
      {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
      <form onSubmit={handleLogin} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </Button>
        <Grid container>
          <Grid item xs>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link component={RouterLink} to="/signup" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;