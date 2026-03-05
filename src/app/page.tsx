'use client';

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import AppLayout from '@/components/AppLayout';
import { AudioEngineProvider, useAudioEngine } from '@/context/AudioEngineContext';

function PageContent() {
  const { engineReady, initializeEngine } = useAudioEngine();

  if (!engineReady) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          background: '#0E0E12',
        }}
      >
        <GraphicEqIcon sx={{ fontSize: 64, color: '#D4A843' }} />
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#E4E1EC', textAlign: 'center' }}>
          Overture
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 360, px: 2 }}>
          A cinematic audio engine for Dungeon Masters. Craft immersive soundscapes for your table.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={initializeEngine}
          sx={{
            borderRadius: 6,
            px: 4,
            py: 1.5,
            background: '#D4A843',
            color: '#0E0E12',
            fontWeight: 700,
            fontSize: '1.1rem',
            '&:hover': { background: '#C49B35' },
          }}
        >
          Start Session
        </Button>
      </Box>
    );
  }

  return <AppLayout />;
}

export default function Page() {
  return (
    <AudioEngineProvider>
      <PageContent />
    </AudioEngineProvider>
  );
}
