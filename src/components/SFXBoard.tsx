'use client';

import React, { useState, useRef } from 'react';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { sfxLibrary, sfxCategories, SFXCategory } from '@/data/sfxLibrary';

interface SFXBoardProps {
  onFireSFX: (assetId: string) => void;
}

export default function SFXBoard({ onFireSFX }: SFXBoardProps) {
  const [category, setCategory] = useState<SFXCategory>('Favourites');
  const holdTimers = useRef<Map<string, number>>(new Map());

  const displayed = sfxLibrary.filter((s) => s.category === category);

  const categoryIcons: Record<SFXCategory, string> = {
    Favourites: '★',
    Combat: '⚔️',
    Environment: '🌿',
    Social: '👥',
    Magic: '✨',
    Tension: '😰',
  };

  const startHold = (assetId: string) => {
    const timer = window.setInterval(() => onFireSFX(assetId), 300);
    holdTimers.current.set(assetId, timer);
  };

  const stopHold = (assetId: string) => {
    const timer = holdTimers.current.get(assetId);
    if (timer) {
      window.clearInterval(timer);
      holdTimers.current.delete(assetId);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>SFX Board</Typography>
      </Box>

      <Tabs
        value={category}
        onChange={(_, v) => setCategory(v as SFXCategory)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          px: 1,
          '& .MuiTab-root': { minWidth: 'auto', px: 1.5, fontSize: '0.75rem' },
          '& .MuiTabs-indicator': { height: 3, borderRadius: 2 },
        }}
      >
        {sfxCategories.map((cat) => (
          <Tab key={cat} value={cat} label={`${categoryIcons[cat]} ${cat}`} />
        ))}
      </Tabs>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(3, 1fr)',
            sm: 'repeat(4, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 1,
          alignContent: 'start',
        }}
      >
        {displayed.map((sfx) => (
          <Button
            key={sfx.id}
            variant="outlined"
            onClick={() => onFireSFX(sfx.assetId)}
            onMouseDown={() => {
              const t = window.setTimeout(() => startHold(sfx.assetId), 500);
              holdTimers.current.set(`${sfx.id}-long`, t);
            }}
            onMouseUp={() => {
              const lt = holdTimers.current.get(`${sfx.id}-long`);
              if (lt) { window.clearTimeout(lt); holdTimers.current.delete(`${sfx.id}-long`); }
              stopHold(sfx.assetId);
            }}
            onMouseLeave={() => stopHold(sfx.assetId)}
            onTouchStart={() => {
              const t = window.setTimeout(() => startHold(sfx.assetId), 500);
              holdTimers.current.set(`${sfx.id}-long`, t);
            }}
            onTouchEnd={() => {
              const lt = holdTimers.current.get(`${sfx.id}-long`);
              if (lt) { window.clearTimeout(lt); holdTimers.current.delete(`${sfx.id}-long`); }
              stopHold(sfx.assetId);
            }}
            sx={{
              flexDirection: 'column',
              aspectRatio: '1',
              gap: 0.5,
              fontSize: '0.7rem',
              textTransform: 'none',
              borderRadius: 3,
              borderColor: 'divider',
              '&:hover': { borderColor: 'primary.main', background: 'action.hover' },
              minHeight: 72,
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{sfx.icon}</span>
            <span>{sfx.label}</span>
          </Button>
        ))}
      </Box>
    </Box>
  );
}
