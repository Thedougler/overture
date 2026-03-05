'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import SceneBrowser from './SceneBrowser';
import NowPlaying from './NowPlaying';
import SFXBoard from './SFXBoard';
import EditMode from './EditMode';
import { useAudioEngine } from '@/context/AudioEngineContext';
import { demoScenes } from '@/data/demoScenes';
import { SceneConfig } from '@/engine/types';

export default function AppLayout() {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.up('sm'));
  const {
    currentScene,
    layerStates,
    transitioning,
    masterVolume,
    setCurrentScene,
    toggleLayer,
    setLayerVolume,
    fireSFX,
    setMasterVolume,
  } = useAudioEngine();

  const [scenes, setScenes] = useState<SceneConfig[]>(demoScenes);
  const [editOpen, setEditOpen] = useState(false);
  const [panelIndex, setPanelIndex] = useState(1); // 0=SceneBrowser, 1=NowPlaying, 2=SFXBoard

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0 && panelIndex < 2) setPanelIndex(panelIndex + 1);
      if (delta > 0 && panelIndex > 0) setPanelIndex(panelIndex - 1);
    }
    touchStartX.current = null;
  }, [panelIndex]);

  const handleSelectSceneAndNavigate = useCallback(
    (scene: SceneConfig) => {
      setCurrentScene(scene);
      setPanelIndex(1);
    },
    [setCurrentScene]
  );

  const handleSaveScene = (partial: Partial<SceneConfig>) => {
    const newScene: SceneConfig = {
      id: `scene-${Date.now()}`,
      name: partial.name ?? 'New Scene',
      descriptor: partial.descriptor ?? '',
      accentColor: partial.accentColor ?? '#D4A843',
      layers: [],
      emitters: [],
      quickfire: [],
    };
    setScenes([...scenes, newScene]);
  };

  if (isTablet) {
    // Three-column persistent layout
    return (
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'background.default' }}>
        {/* SceneBrowser: 280px */}
        <Box sx={{ width: 280, flexShrink: 0, borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
          <SceneBrowser
            scenes={scenes}
            currentScene={currentScene}
            onSelectScene={setCurrentScene}
            onNewScene={() => setEditOpen(true)}
          />
        </Box>

        {/* NowPlaying: flex-grow */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <NowPlaying
            scene={currentScene}
            layerStates={layerStates}
            transitioning={transitioning}
            masterVolume={masterVolume}
            onToggleLayer={toggleLayer}
            onLayerVolume={setLayerVolume}
            onFireSFX={fireSFX}
            onMasterVolume={setMasterVolume}
          />
        </Box>

        {/* SFXBoard: 320px */}
        <Box sx={{ width: 320, flexShrink: 0, borderLeft: 1, borderColor: 'divider', overflowY: 'auto' }}>
          <SFXBoard onFireSFX={fireSFX} />
        </Box>

        <EditMode open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSaveScene} />
      </Box>
    );
  }

  // Mobile: three-panel swipe
  const panels = [
    <SceneBrowser
      key="browser"
      scenes={scenes}
      currentScene={currentScene}
      onSelectScene={handleSelectSceneAndNavigate}
      onNewScene={() => setEditOpen(true)}
    />,
    <NowPlaying
      key="nowplaying"
      scene={currentScene}
      layerStates={layerStates}
      transitioning={transitioning}
      masterVolume={masterVolume}
      onToggleLayer={toggleLayer}
      onLayerVolume={setLayerVolume}
      onFireSFX={fireSFX}
      onMasterVolume={setMasterVolume}
    />,
    <SFXBoard key="sfxboard" onFireSFX={fireSFX} />,
  ];

  return (
    <Box
      sx={{ height: '100vh', overflow: 'hidden', position: 'relative', background: 'background.default' }}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Box
        sx={{
          display: 'flex',
          width: '300vw',
          height: 'calc(100% - 40px)',
          transform: `translateX(${-panelIndex * 100}vw)`,
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {panels.map((panel, i) => (
          <Box key={i} sx={{ width: '100vw', height: '100%', overflowY: 'auto' }}>
            {panel}
          </Box>
        ))}
      </Box>

      {/* Panel dots */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            onClick={() => setPanelIndex(i)}
            sx={{
              width: i === panelIndex ? 20 : 8,
              height: 8,
              borderRadius: 4,
              background: i === panelIndex ? 'primary.main' : 'divider',
              transition: 'all 0.3s',
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>

      <EditMode open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSaveScene} />
    </Box>
  );
}
