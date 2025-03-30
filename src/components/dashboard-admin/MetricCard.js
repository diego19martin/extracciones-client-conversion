// src/components/dashboard-admin/MetricCard.js
import React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
}));

const DashboardCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  paddingTop: theme.spacing(1),
}));

const MetricCard = ({ title, value, icon, color, subtitle, trend, trendValue }) => {
  const theme = useTheme();
  
  let trendIcon = null;
  let trendColor = theme.palette.text.secondary;
  
  if (trend === 'up') {
    trendIcon = <TrendingUp fontSize="small" />;
    trendColor = theme.palette.success.main;
  } else if (trend === 'down') {
    trendIcon = <TrendingDown fontSize="small" />;
    trendColor = theme.palette.error.main;
  }
  
  return (
    <DashboardCard elevation={3}>
      <DashboardCardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: '50%', 
              bgcolor: `${color}20`, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5
            }}
          >
            {React.cloneElement(icon, { style: { color } })}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', color: trendColor }}>
                {trendIcon}
                <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'medium', color: trendColor }}>
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default MetricCard;