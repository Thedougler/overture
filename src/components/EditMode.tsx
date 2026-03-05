'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  Slide,
  TextField,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import { SceneConfig } from '@/engine/types';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface EditModeProps {
  open: boolean;
  scene?: SceneConfig;
  onClose: () => void;
  onSave: (scene: Partial<SceneConfig>) => void;
}

const COLOR_SWATCHES = ['#D4A843', '#4A8C3F', '#6B6B8A', '#8C3F3F', '#3F6B8C', '#8C5E3F'];

export default function EditMode({ open, scene, onClose, onSave }: EditModeProps) {
  const [name, setName] = useState(scene?.name ?? '');
  const [descriptor, setDescriptor] = useState(scene?.descriptor ?? '');
  const [accentColor, setAccentColor] = useState(scene?.accentColor ?? '#D4A843');

  const handleSave = () => {
    onSave({ name, descriptor, accentColor });
    onClose();
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      PaperProps={{ sx: { background: '#0E0E12' } }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, height: '100%', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ flex: 1, fontWeight: 700 }}>
            {scene ? 'Edit Scene' : 'New Scene'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <TextField
          label="Scene Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />

        <TextField
          label="Description"
          value={descriptor}
          onChange={(e) => setDescriptor(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
            Accent Color
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {COLOR_SWATCHES.map((color) => (
              <Box
                key={color}
                onClick={() => setAccentColor(color)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: color,
                  cursor: 'pointer',
                  border: accentColor === color ? '3px solid white' : '3px solid transparent',
                  transition: 'border-color 0.2s',
                  boxShadow: accentColor === color ? `0 0 0 2px ${color}` : 'none',
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={onClose} sx={{ flex: 1, borderRadius: 3, py: 1.5 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              flex: 1,
              borderRadius: 3,
              py: 1.5,
              background: accentColor,
              '&:hover': { background: accentColor, filter: 'brightness(1.15)' },
            }}
          >
            Save Scene
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
