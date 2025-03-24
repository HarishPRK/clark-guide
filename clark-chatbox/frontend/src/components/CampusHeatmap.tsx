import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';

export interface HeatmapData {
  locationId: string;
  name: string;
  occupancy: number; // 0-1 percentage
}

interface CampusHeatmapProps {
  data: HeatmapData[];
  onLocationClick?: (locationId: string) => void;
  onClose?: () => void; // Add new onClose callback prop
}

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const CampusHeatmap: React.FC<CampusHeatmapProps> = ({ data, onLocationClick, onClose }) => {
  const theme = useTheme();
  
  // Sort by occupancy (highest first)
  const sortedData = [...data].sort((a, b) => b.occupancy - a.occupancy);
  
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        borderRadius: 2, 
        my: 1,
        background: '#f8f9fa',
        border: '1px solid #e0e0e0'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600, 
            display: 'flex',
            alignItems: 'center',
            color: '#333'
          }}
        >
          <Box 
            component="span" 
            sx={{ 
              width: 14, 
              height: 14, 
              borderRadius: '50%', 
              bgcolor: '#FF6B81', 
              display: 'inline-block',
              mr: 1 
            }} 
          />
          Campus Activity Heatmap
        </Typography>
        
        {onClose && (
          <IconButton 
            size="small" 
            onClick={onClose}
            sx={{ 
              color: '#666',
              padding: '4px',
              '&:hover': {
                color: '#FF6B81',
                backgroundColor: 'rgba(255, 107, 129, 0.08)'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {sortedData.map(location => (
          <Box 
            key={location.locationId}
            onClick={() => onLocationClick?.(location.locationId)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.75,
              borderRadius: 1,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                flex: 1, 
                fontSize: '0.8rem', 
                fontWeight: location.occupancy > 0.7 ? 600 : 400 
              }}
            >
              {location.name}
            </Typography>
            
            <Box sx={{ 
              width: 100, 
              height: 8, 
              borderRadius: 4,
              bgcolor: '#e0e0e0',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                height: '100%',
                width: `${location.occupancy * 100}%`,
                bgcolor: location.occupancy > 0.8 
                  ? '#f44336' // red for crowded
                  : location.occupancy > 0.5 
                    ? '#ff9800' // orange for medium
                    : '#4caf50', // green for empty
                transition: 'width 1s ease-in-out'
              }} />
            </Box>
            
            <Typography 
              variant="caption" 
              sx={{ 
                ml: 1, 
                width: 42, 
                textAlign: 'right',
                color: location.occupancy > 0.8 
                  ? '#d32f2f' // dark red
                  : location.occupancy > 0.5 
                    ? '#e65100' // dark orange
                    : '#2e7d32' // dark green
              }}
            >
              {Math.round(location.occupancy * 100)}%
            </Typography>
          </Box>
        ))}
      </Box>
      
      <Typography 
        variant="caption" 
        sx={{ 
          mt: 1.5, 
          display: 'block', 
          color: 'text.secondary',
          fontStyle: 'italic',
          textAlign: 'right'
        }}
      >
        Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Paper>
  );
};

export default CampusHeatmap;
