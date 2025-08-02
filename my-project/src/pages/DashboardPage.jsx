import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Grid, List, ListItemButton, ListItemText, Paper, CircularProgress,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, MenuItem, InputLabel, FormControl, IconButton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import IssueCard from '../components/IssueCard';
import useDebounce from '../hooks/useDebounce';

// Reusable Kanban Column Component
const KanbanColumn = ({ title, issues, onAddIssue, onCardClick }) => (
  <Grid item xs={12} md={4}>
    <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', height: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" gutterBottom>{title}</Typography>
        <IconButton size="small" onClick={() => onAddIssue(title.toLowerCase().replace(' ', '_'))}>
          <AddCircleOutlineIcon />
        </IconButton>
      </Box>
      {issues.map(issue => <Box key={issue.id} onClick={() => onCardClick(issue)}><IssueCard issue={issue} /></Box>)}
    </Paper>
  </Grid>
);

const DashboardPage = () => {
  // --- State Management ---
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const { logout } = useAuth();

  // Dialogs State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', priority: 'medium', status: 'open' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // --- Effects ---

  // WebSocket Listeners
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('connect', () => console.log('WebSocket Connected!'));

    const handleIssueCreated = (createdIssue) => {
      if (createdIssue.projectId === selectedProjectId) setIssues(prev => [...prev, createdIssue]);
    };
    const handleIssueUpdated = (updatedIssue) => {
      if (updatedIssue.projectId === selectedProjectId) setIssues(prev => prev.map(i => i.id === updatedIssue.id ? updatedIssue : i));
    };
    const handleIssueDeleted = (deletedIssue) => {
      setIssues(prev => prev.filter(i => i.id !== deletedIssue.id));
    };

    socket.on('issue:created', handleIssueCreated);
    socket.on('issue:updated', handleIssueUpdated);
    socket.on('issue:deleted', handleIssueDeleted);

    return () => socket.disconnect();
  }, [selectedProjectId]);

  // Fetch Projects
  useEffect(() => {
    api.get('/projects').then(response => {
      setProjects(response.data);
      if (response.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(response.data[0].id);
      }
    }).catch(error => console.error('Failed to fetch projects', error));
  }, [selectedProjectId]);

  // Fetch Issues based on filters
  useEffect(() => {
    if (!selectedProjectId) return;
    setLoadingIssues(true);
    
    const params = new URLSearchParams({ projectId: selectedProjectId });
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (statusFilter) params.append('status', statusFilter);
    if (priorityFilter) params.append('priority', priorityFilter);

    api.get(`/issues?${params.toString()}`)
      .then(response => setIssues(response.data))
      .catch(error => console.error('Failed to fetch issues', error))
      .finally(() => setLoadingIssues(false));
  }, [selectedProjectId, debouncedSearchTerm, statusFilter, priorityFilter]);

  // --- Handlers ---
  const handleOpenCreateDialog = (status) => {
    setNewIssue({ title: '', description: '', priority: 'medium', status });
    setCreateDialogOpen(true);
  };
  const handleCreateIssue = async () => {
    await api.post('/issues', { ...newIssue, projectId: selectedProjectId });
    setCreateDialogOpen(false);
  };

  const handleOpenEditDialog = (issue) => {
    setCurrentIssue(issue);
    setEditDialogOpen(true);
  };
  const handleUpdateIssue = async () => {
    if (!currentIssue) return;
    await api.patch(`/issues/${currentIssue.id}`, currentIssue);
    setEditDialogOpen(false);
  };
  const handleDeleteIssue = async () => {
    if (!currentIssue) return;
    await api.delete(`/issues/${currentIssue.id}`);
    setEditDialogOpen(false);
  };

  // --- Filtering Logic for Display ---
  const openIssues = issues.filter(issue => issue.status === 'open');
  const inProgressIssues = issues.filter(issue => issue.status === 'in_progress');
  const doneIssues = issues.filter(issue => issue.status === 'done');

  return (
    <Container maxWidth="xl" sx={{ mt: 4, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" component="h1">SyncFlow Dashboard</Typography>
        <Button variant="contained" onClick={logout}>Logout</Button>
      </Box>

      <Grid container spacing={4} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Grid item xs={12} md={3} sx={{ height: '100%', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Projects</Typography>
          <Paper elevation={2}>
            <List>{projects.map(p => <ListItemButton key={p.id} selected={selectedProjectId === p.id} onClick={() => setSelectedProjectId(p.id)}><ListItemText primary={p.name} /></ListItemButton>)}</List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, mb: 2, flexShrink: 0 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}><TextField fullWidth label="Search issues..." variant="outlined" size="small" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></Grid>
              <Grid item xs={6} sm={3}><FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}><MenuItem value=""><em>All</em></MenuItem><MenuItem value="open">Open</MenuItem><MenuItem value="in_progress">In Progress</MenuItem><MenuItem value="done">Done</MenuItem></Select></FormControl></Grid>
              <Grid item xs={6} sm={3}><FormControl fullWidth size="small"><InputLabel>Priority</InputLabel><Select value={priorityFilter} label="Priority" onChange={e => setPriorityFilter(e.target.value)}><MenuItem value=""><em>All</em></MenuItem><MenuItem value="low">Low</MenuItem><MenuItem value="medium">Medium</MenuItem><MenuItem value="high">High</MenuItem></Select></FormControl></Grid>
            </Grid>
          </Paper>

          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {loadingIssues ? <CircularProgress /> : (
              <Grid container spacing={2} sx={{ height: '100%' }}>
                <KanbanColumn title="Open" issues={openIssues} onAddIssue={handleOpenCreateDialog} onCardClick={handleOpenEditDialog} />
                <KanbanColumn title="In Progress" issues={inProgressIssues} onAddIssue={handleOpenCreateDialog} onCardClick={handleOpenEditDialog} />
                <KanbanColumn title="Done" issues={doneIssues} onAddIssue={handleOpenCreateDialog} onCardClick={handleOpenEditDialog} />
              </Grid>
            )}
          </Box>
        </Grid>
      </Grid>
      
      {/* Create Issue Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Issue</DialogTitle>
        <DialogContent>
          <TextField autoFocus required margin="dense" label="Issue Title" type="text" fullWidth variant="outlined" value={newIssue.title} onChange={e => setNewIssue({ ...newIssue, title: e.target.value })} />
          <TextField margin="dense" label="Description" type="text" fullWidth multiline rows={4} variant="outlined" value={newIssue.description} onChange={e => setNewIssue({ ...newIssue, description: e.target.value })} />
          <FormControl fullWidth margin="dense"><InputLabel>Priority</InputLabel><Select value={newIssue.priority} label="Priority" onChange={e => setNewIssue({ ...newIssue, priority: e.target.value })}><MenuItem value="low">Low</MenuItem><MenuItem value="medium">Medium</MenuItem><MenuItem value="high">High</MenuItem></Select></FormControl>
        </DialogContent>
        <DialogActions><Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateIssue} variant="contained">Create</Button></DialogActions>
      </Dialog>
      
      {/* Edit Issue Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Issue</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Issue Title" type="text" fullWidth variant="outlined" value={currentIssue?.title || ''} onChange={e => setCurrentIssue({...currentIssue, title: e.target.value})} />
          <TextField margin="dense" label="Description" type="text" fullWidth multiline rows={4} variant="outlined" value={currentIssue?.description || ''} onChange={e => setCurrentIssue({...currentIssue, description: e.target.value})} />
          <FormControl fullWidth margin="dense"><InputLabel>Status</InputLabel><Select value={currentIssue?.status || 'open'} label="Status" onChange={e => setCurrentIssue({...currentIssue, status: e.target.value})}><MenuItem value="open">Open</MenuItem><MenuItem value="in_progress">In Progress</MenuItem><MenuItem value="done">Done</MenuItem></Select></FormControl>
          <FormControl fullWidth margin="dense"><InputLabel>Priority</InputLabel><Select value={currentIssue?.priority || 'medium'} label="Priority" onChange={e => setCurrentIssue({...currentIssue, priority: e.target.value})}><MenuItem value="low">Low</MenuItem><MenuItem value="medium">Medium</MenuItem><MenuItem value="high">High</MenuItem></Select></FormControl>
        </DialogContent>
        <DialogActions sx={{justifyContent: 'space-between', px: 3, pb: 2}}><Button onClick={handleDeleteIssue} variant="outlined" color="error">Delete</Button><Box><Button onClick={() => setEditDialogOpen(false)}>Cancel</Button><Button onClick={handleUpdateIssue} variant="contained">Save Changes</Button></Box></DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;