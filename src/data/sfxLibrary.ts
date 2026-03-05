import { QuickfireSFX } from '@/engine/types';

export type SFXCategory = 'Favourites' | 'Combat' | 'Environment' | 'Social' | 'Magic' | 'Tension';

export interface SFXEntry extends QuickfireSFX {
  category: SFXCategory;
}

export const sfxLibrary: SFXEntry[] = [
  // Favourites
  { id: 'sfx-sword-clash', label: 'Sword Clash', icon: '⚔️', assetId: 'sword-clash', category: 'Favourites' },
  { id: 'sfx-thunder', label: 'Thunder', icon: '⛈️', assetId: 'thunder-crack', category: 'Favourites' },
  { id: 'sfx-crowd-gasp', label: 'Crowd Gasp', icon: '😮', assetId: 'crowd-gasp', category: 'Favourites' },
  // Combat
  { id: 'sfx-sword-draw', label: 'Sword Draw', icon: '🗡️', assetId: 'sword-draw', category: 'Combat' },
  { id: 'sfx-arrow-hit', label: 'Arrow Hit', icon: '🏹', assetId: 'arrow-hit', category: 'Combat' },
  { id: 'sfx-shield-block', label: 'Shield Block', icon: '🛡️', assetId: 'shield-block', category: 'Combat' },
  { id: 'sfx-battle-cry', label: 'Battle Cry', icon: '😤', assetId: 'battle-cry', category: 'Combat' },
  // Environment
  { id: 'sfx-door-creak', label: 'Door Creak', icon: '🚪', assetId: 'door-creak', category: 'Environment' },
  { id: 'sfx-wind', label: 'Wind Gust', icon: '🌬️', assetId: 'wind-gust', category: 'Environment' },
  { id: 'sfx-rain', label: 'Rain', icon: '🌧️', assetId: 'rain-start', category: 'Environment' },
  { id: 'sfx-fire-crackle', label: 'Fire Crackle', icon: '🔥', assetId: 'fire-crackle', category: 'Environment' },
  // Social
  { id: 'sfx-coin', label: 'Coin Drop', icon: '🪙', assetId: 'coin-drop', category: 'Social' },
  { id: 'sfx-laugh', label: 'Crowd Laugh', icon: '😂', assetId: 'crowd-laugh', category: 'Social' },
  { id: 'sfx-gasp', label: 'Shocked Gasp', icon: '😲', assetId: 'shocked-gasp', category: 'Social' },
  { id: 'sfx-tankard', label: 'Tankard Slam', icon: '🍺', assetId: 'tankard-slam', category: 'Social' },
  // Magic
  { id: 'sfx-spell-cast', label: 'Spell Cast', icon: '✨', assetId: 'spell-cast', category: 'Magic' },
  { id: 'sfx-teleport', label: 'Teleport', icon: '💫', assetId: 'teleport', category: 'Magic' },
  { id: 'sfx-magic-fail', label: 'Magic Fizzle', icon: '💨', assetId: 'magic-fizzle', category: 'Magic' },
  // Tension
  { id: 'sfx-heartbeat', label: 'Heartbeat', icon: '💓', assetId: 'heartbeat', category: 'Tension' },
  { id: 'sfx-scream', label: 'Distant Scream', icon: '😱', assetId: 'distant-scream', category: 'Tension' },
  { id: 'sfx-stinger', label: 'Tension Stinger', icon: '😰', assetId: 'tension-stinger', category: 'Tension' },
];

export const sfxCategories: SFXCategory[] = [
  'Favourites',
  'Combat',
  'Environment',
  'Social',
  'Magic',
  'Tension',
];
