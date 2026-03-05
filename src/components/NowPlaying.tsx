'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  LinearProgress,
  Slider,
  Button,
  Drawer,
  Stack,
} from '@mui/material';
import { SceneConfig, LayerState } from '@/engine/types';

interface NowPlayingProps {
  scene: SceneConfig | null;
  layerStates: Map<string, LayerState>;
  transitioning: boolean;
  masterVolume: number;
  onToggleLayer: (id: string) => void;
  onLayerVolume: (id: string, vol: number) => void;
  onFireSFX: (assetId: string) => void;
  onMasterVolume: (vol: number) => void;
}

export default function NowPlaying({
  scene,
  layerStates,
  transitioning,
  masterVolume,
  onToggleLayer,
  onLayerVolume,
  onFireSFX,
  onMasterVolume,
}: NowPlayingProps) {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLayerTap = (layerId: string) => {
    onToggleLayer(layerId);
  };

  const handleLayerLongPress = (layerId: string) => {
    setSelectedLayer(layerId);
  };

  const handleTouchStart = (layerId: string) => {
    longPressTimer.current = setTimeout(() => handleLayerLongPress(layerId), 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const accentColor = scene?.accentColor ?? '#D4A843';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2, overflowY: 'auto' }}>
      {/* Scene header card */}
      <Card
        sx={{
          background: `linear-gradient(135deg, ${accentColor}22 0%, #1C1C2400 100%)`,
          border: `1px solid ${accentColor}44`,
          borderRadius: 4,
        }}
      >
        <CardContent>
          <Typography variant="overline" sx={{ color: accentColor, fontWeight: 700, letterSpacing: 2 }}>
            Now Playing
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
            {scene?.name ?? 'No Scene Selected'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {scene?.descriptor ?? 'Select a scene from the left panel to begin'}
          </Typography>
        </CardContent>
        {transitioning && <LinearProgress sx={{ mx: 2, mb: 2, borderRadius: 2 }} />}
      </Card>

      {/* Layer pills */}
      {scene && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
            Layers
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {scene.layers.map((layer) => {
              const state = layerStates.get(layer.id);
              const isMuted = state?.muted ?? false;
              return (
                <Chip
                  key={layer.id}
                  label={`${layer.icon ?? '🎵'} ${layer.name}`}
                  onClick={() => handleLayerTap(layer.id)}
                  onTouchStart={() => handleTouchStart(layer.id)}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={() => {
                    longPressTimer.current = setTimeout(() => handleLayerLongPress(layer.id), 500);
                  }}
                  onMouseUp={handleTouchEnd}
                  sx={{
                    opacity: isMuted ? 0.4 : 1,
                    borderColor: isMuted ? 'divider' : accentColor,
                    border: '1px solid',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  variant={isMuted ? 'outlined' : 'filled'}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Quick-fire SFX strip */}
      {scene && scene.quickfire.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
            Quick SFX
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
            }}
          >
            {scene.quickfire.map((sfx) => (
              <Button
                key={sfx.id}
                variant="outlined"
                onClick={() => onFireSFX(sfx.assetId)}
                sx={{
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1.5,
                  borderColor: `${accentColor}44`,
                  '&:hover': { borderColor: accentColor, background: `${accentColor}11` },
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{sfx.icon}</span>
                {sfx.label}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {/* Master volume strip */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
          Master Volume
        </Typography>
        <Slider
          value={masterVolume}
          min={0}
          max={1}
          step={0.01}
          onChange={(_, v) => onMasterVolume(v as number)}
          onDoubleClick={() => onMasterVolume(0.8)}
          sx={{ color: accentColor }}
        />
      </Box>

      {/* Layer volume drawer */}
      <Drawer
        anchor="bottom"
        open={selectedLayer !== null}
        onClose={() => setSelectedLayer(null)}
        PaperProps={{ sx: { borderRadius: '24px 24px 0 0', p: 3, background: '#1C1C24' } }}
      >
        {selectedLayer && (() => {
          const layer = scene?.layers.find(l => l.id === selectedLayer);
          const state = layerStates.get(selectedLayer);
          if (!layer) return null;
          return (
            <Stack spacing={2}>
              <Typography variant="h6">{layer.icon} {layer.name}</Typography>
              <Typography variant="caption" color="text.secondary">Volume</Typography>
              <Slider
                value={state?.volume ?? layer.baseGain}
                min={0}
                max={1}
                step={0.01}
                onChange={(_, v) => onLayerVolume(selectedLayer, v as number)}
                sx={{ color: accentColor }}
              />
            </Stack>
          );
        })()}
      </Drawer>
    </Box>
  );
}
