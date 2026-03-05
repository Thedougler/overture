'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Fab,
  InputAdornment,
  TextField,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SceneConfig } from '@/engine/types';

interface SceneBrowserProps {
  scenes: SceneConfig[];
  currentScene: SceneConfig | null;
  onSelectScene: (scene: SceneConfig) => void;
  onNewScene: () => void;
}

export default function SceneBrowser({
  scenes,
  currentScene,
  onSelectScene,
  onNewScene,
}: SceneBrowserProps) {
  const [search, setSearch] = useState('');
  const [sessionExpanded, setSessionExpanded] = useState(true);
  const [allExpanded, setAllExpanded] = useState(true);

  const filtered = scenes.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.descriptor.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.slice(0, 1);
  const all = filtered;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, gap: 2, overflowY: 'auto', position: 'relative' }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Scenes</Typography>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Search scenes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6 } }}
      />

      {/* This Session */}
      <Box>
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 1 }}
          onClick={() => setSessionExpanded(!sessionExpanded)}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, flex: 1 }}>
            This Session
          </Typography>
          <IconButton size="small" sx={{ transform: sessionExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>
        <Collapse in={sessionExpanded}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {pinned.map((scene) => (
              <SceneCard key={scene.id} scene={scene} isActive={currentScene?.id === scene.id} onSelect={onSelectScene} />
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* All Scenes */}
      <Box>
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 1 }}
          onClick={() => setAllExpanded(!allExpanded)}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, flex: 1 }}>
            All Scenes
          </Typography>
          <IconButton size="small" sx={{ transform: allExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>
        <Collapse in={allExpanded}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {all.map((scene) => (
              <SceneCard key={scene.id} scene={scene} isActive={currentScene?.id === scene.id} onSelect={onSelectScene} />
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* New Scene FAB */}
      <Fab
        color="primary"
        aria-label="New Scene"
        onClick={onNewScene}
        variant="extended"
        sx={{
          position: 'sticky',
          bottom: 16,
          alignSelf: 'flex-end',
          mt: 'auto',
          gap: 1,
        }}
      >
        <AddIcon />
        New Scene
      </Fab>
    </Box>
  );
}

function SceneCard({
  scene,
  isActive,
  onSelect,
}: {
  scene: SceneConfig;
  isActive: boolean;
  onSelect: (scene: SceneConfig) => void;
}) {
  return (
    <Card
      sx={{
        borderLeft: `4px solid ${scene.accentColor}`,
        background: isActive ? `${scene.accentColor}18` : 'background.paper',
        borderRadius: 3,
        transition: 'background 0.2s',
      }}
    >
      <CardActionArea onClick={() => onSelect(scene)} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {scene.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {scene.descriptor}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
