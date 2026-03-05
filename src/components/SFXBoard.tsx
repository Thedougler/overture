'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { sfxLibrary, sfxCategories, SFXCategory } from '@/data/sfxLibrary';

interface SFXBoardProps {
  onFireSFX: (assetId: string) => void;
}

export default function SFXBoard({ onFireSFX }: SFXBoardProps) {
  const [category, setCategory] = useState<SFXCategory>('Favourites');
  const longPressTimers = useRef<Map<string, number>>(new Map());
  const repeatIntervals = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const timers = longPressTimers.current;
    const intervals = repeatIntervals.current;
    return () => {
      for (const t of timers.values()) window.clearTimeout(t);
      timers.clear();
      for (const i of intervals.values()) window.clearInterval(i);
      intervals.clear();
    };
  }, []);

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
    const interval = window.setInterval(() => onFireSFX(assetId), 300);
    repeatIntervals.current.set(assetId, interval);
  };

  const stopHold = (assetId: string) => {
    const interval = repeatIntervals.current.get(assetId);
    if (interval) {
      window.clearInterval(interval);
      repeatIntervals.current.delete(assetId);
    }
  };

  const cancelLongPress = (sfxId: string, assetId: string) => {
    const lt = longPressTimers.current.get(sfxId);
    if (lt) {
      window.clearTimeout(lt);
      longPressTimers.current.delete(sfxId);
    }
    stopHold(assetId);
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
              longPressTimers.current.set(sfx.id, t);
            }}
            onMouseUp={() => {
              const lt = longPressTimers.current.get(sfx.id);
              if (lt) {
                window.clearTimeout(lt);
                longPressTimers.current.delete(sfx.id);
              }
              stopHold(sfx.assetId);
            }}
            onMouseLeave={() => cancelLongPress(sfx.id, sfx.assetId)}
            onTouchStart={() => {
              const t = window.setTimeout(() => startHold(sfx.assetId), 500);
              longPressTimers.current.set(sfx.id, t);
            }}
            onTouchEnd={() => {
              const lt = longPressTimers.current.get(sfx.id);
              if (lt) {
                window.clearTimeout(lt);
                longPressTimers.current.delete(sfx.id);
              }
              stopHold(sfx.assetId);
            }}
            onTouchCancel={() => cancelLongPress(sfx.id, sfx.assetId)}
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
