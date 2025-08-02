import React from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';

// Function to get a color based on priority
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

const IssueCard = ({ issue }) => {
  return (
    <Card sx={{ mb: 2, cursor: 'pointer' }}>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          {issue.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {issue.description || 'No description'}
        </Typography>
        <Chip
          label={issue.priority}
          color={getPriorityColor(issue.priority)}
          size="small"
          sx={{ mt: 1 }}
        />
      </CardContent>
    </Card>
  );
};

export default IssueCard;