'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AudioEngine, getAudioEngine } from '@/engine/audioEngine';
import { SceneConfig, LayerState } from '@/engine/types';

interface AudioEngineContextValue {
  engine: AudioEngine | null;
  engineReady: boolean;
  currentScene: SceneConfig | null;
  layerStates: Map<string, LayerState>;
  transitioning: boolean;
  masterVolume: number;
  initializeEngine: () => Promise<void>;
  setCurrentScene: (scene: SceneConfig) => Promise<void>;
  toggleLayer: (id: string) => void;
  setLayerVolume: (id: string, vol: number) => void;
  fireSFX: (assetId: string) => void;
  setMasterVolume: (vol: number) => void;
}

const AudioEngineContext = createContext<AudioEngineContextValue>({
  engine: null,
  engineReady: false,
  currentScene: null,
  layerStates: new Map(),
  transitioning: false,
  masterVolume: 0.8,
  initializeEngine: async () => {},
  setCurrentScene: async () => {},
  toggleLayer: () => {},
  setLayerVolume: () => {},
  fireSFX: () => {},
  setMasterVolume: () => {},
});

export function AudioEngineProvider({ children }: { children: React.ReactNode }) {
  const [engineReady, setEngineReady] = useState(false);
  const [currentScene, setCurrentSceneState] = useState<SceneConfig | null>(null);
  const [layerStates, setLayerStates] = useState<Map<string, LayerState>>(new Map());
  const [transitioning, setTransitioning] = useState(false);
  const [masterVolume, setMasterVolumeState] = useState(0.8);
  const engineRef = useRef<AudioEngine | null>(null);
  const rafRef = useRef<number | null>(null);

  const syncState = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !engine.director) return;
    setLayerStates(new Map(engine.director.getLayerStates()));
    setTransitioning(engine.director.transitioning);
    setCurrentSceneState(engine.director.currentScene);
    if (engine.mixer) {
      setMasterVolumeState(engine.mixer.getMasterVolume());
    }
    rafRef.current = requestAnimationFrame(syncState);
  }, []);

  const initializeEngine = useCallback(async () => {
    if (engineReady) return;
    const engine = getAudioEngine();
    engineRef.current = engine;
    await engine.initialize();
    setEngineReady(true);
    rafRef.current = requestAnimationFrame(syncState);
  }, [engineReady, syncState]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const setCurrentScene = useCallback(async (scene: SceneConfig) => {
    const engine = engineRef.current;
    if (!engine || !engine.director) return;
    await engine.director.loadScene(scene, scene.assetManifest ?? {});
    engine.director.activateScene(scene);
  }, []);

  const toggleLayer = useCallback((id: string) => {
    const engine = engineRef.current;
    if (!engine || !engine.director) return;
    engine.director.toggleLayerMute(id);
  }, []);

  const setLayerVolume = useCallback((id: string, vol: number) => {
    const engine = engineRef.current;
    if (!engine || !engine.director) return;
    engine.director.setLayerVolume(id, vol);
  }, []);

  const fireSFX = useCallback((assetId: string) => {
    const engine = engineRef.current;
    if (!engine || !engine.director) return;
    engine.director.fireSFX(assetId);
  }, []);

  const setMasterVolume = useCallback((vol: number) => {
    const engine = engineRef.current;
    if (!engine || !engine.mixer) return;
    engine.mixer.setMasterVolume(vol, engine.context.currentTime);
    setMasterVolumeState(vol);
  }, []);

  return (
    <AudioEngineContext.Provider
      value={{
        engine: engineRef.current,
        engineReady,
        currentScene,
        layerStates,
        transitioning,
        masterVolume,
        initializeEngine,
        setCurrentScene,
        toggleLayer,
        setLayerVolume,
        fireSFX,
        setMasterVolume,
      }}
    >
      {children}
    </AudioEngineContext.Provider>
  );
}

export function useAudioEngine() {
  return useContext(AudioEngineContext);
}
