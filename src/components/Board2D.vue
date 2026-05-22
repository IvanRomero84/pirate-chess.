<template>
  <div class="board-2d-container">
    <div class="board-2d-frame">
      <div class="board-grid">
        <template v-for="r in rows" :key="'row-' + r">
          <div 
            v-for="c in cols" 
            :key="'sq-' + r + '-' + c"
            class="square"
            :class="[
              (r + c) % 2 === 0 ? 'light' : 'dark',
              { 
                'selected': isSelected(getSquareName(r, c)),
                'has-valid-move': getValidMove(getSquareName(r, c)),
                'has-capture-move': getValidMove(getSquareName(r, c))?.captured,
                'top-row-grid': r === rows[0]
              }
            ]"
            @click="handleSquareClick(getSquareName(r, c))"
          >
            <!-- Coordinate Labels on Board Edges -->
            <span v-if="shouldShowColLabel(r, c)" class="label-col">
              {{ 'abcdefgh'[c] }}
            </span>
            <span v-if="shouldShowRowLabel(r, c)" class="label-row">
              {{ 8 - r }}
            </span>

            <!-- Piece Token -->
            <div 
              v-if="getPieceAt(r, c)" 
              class="piece-token"
              :class="[getPieceAt(r, c)?.color]"
              :style="{ boxShadow: getGlowShadow(getPieceAt(r, c)?.type || '', getPieceAt(r, c)?.color || '') }"
            >
              <div class="piece-portrait-wrapper">
                <img 
                  :src="getPieceImage(getPieceAt(r, c)?.type || '', getPieceAt(r, c)?.color || '')" 
                  class="piece-portrait" 
                  :alt="getPieceCharacterName(getPieceAt(r, c)?.type || '', getPieceAt(r, c)?.color || '')" 
                />
              </div>
              <span class="character-name">{{ getPieceCharacterName(getPieceAt(r, c)?.type || '', getPieceAt(r, c)?.color || '') }}</span>
            </div>

            <!-- Valid Move Overlay Dot / Ring -->
            <div v-if="getValidMove(getSquareName(r, c))" class="move-indicator"></div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { GameManager } from '../engine/GameManager';

const props = defineProps<{
  manager: GameManager | null;
}>();

const gameStore = useGameStore();

const board = computed(() => gameStore.game.getBoard());

// Rows (ranks) 0 represents rank 8, 7 represents rank 1
const rows = computed(() => {
  const list = [0, 1, 2, 3, 4, 5, 6, 7];
  if (gameStore.playerColor === 'b') {
    return list.slice().reverse();
  }
  return list;
});

// Cols (files) 0 represents 'a', 7 represents 'h'
const cols = computed(() => {
  const list = [0, 1, 2, 3, 4, 5, 6, 7];
  if (gameStore.playerColor === 'b') {
    return list.slice().reverse();
  }
  return list;
});

const getSquareName = (r: number, c: number): string => {
  const files = 'abcdefgh';
  return `${files[c]}${8 - r}`;
};

const getPieceAt = (r: number, c: number) => {
  if (!board.value || !board.value[r]) return null;
  return board.value[r][c];
};

const isSelected = (squareName: string) => {
  return gameStore.selectedSquare === squareName;
};

const getValidMove = (squareName: string) => {
  return gameStore.validMoves.find(m => m.to === squareName);
};

// Handle clicks via the GameManager's 2D click action
const handleSquareClick = async (squareName: string) => {
  if (props.manager) {
    await props.manager.handle2DSquareClick(squareName);
  }
};

// Edge coordinate labels helper
const shouldShowColLabel = (r: number, c: number) => {
  // Show at the bottom of the board
  if (gameStore.playerColor === 'b') {
    return r === 0; // Rank 8 (raw row 0) is at the bottom when flipped
  }
  return r === 7; // Rank 1 (raw row 7) is at the bottom normally
};

const shouldShowRowLabel = (r: number, c: number) => {
  // Show on the left edge
  if (gameStore.playerColor === 'b') {
    return c === 7; // File 'h' (raw col 7) is on the left when flipped
  }
  return c === 0; // File 'a' (raw col 0) is on the left normally
};

// Custom dynamic 2D graphic portraits helper
const getPieceImage = (type: string, color: string): string => {
  const images: Record<string, Record<string, string>> = {
    w: {
      k: '/Luffy_2d.webp',
      q: '/Nami_2d.webp',
      b: '/Roronoa_Zoro_2d.webp',
      n: '/Sanji_2d.webp',
      r: '/Jinbe_2d.webp',
      p: '/Piratas_de_Sombrero_de_Paja_bandera.webp'
    },
    b: {
      k: '/Sengoku_2d.webp',
      q: '/Sakazuki_2d.webp',
      b: '/Kuzan_2d.webp',
      n: '/Borsalino_2d.webp',
      r: '/Fujitora_2d.webp',
      p: '/Marine_bandera.webp'
    }
  };
  return images[color]?.[type] || '';
};

// Canon character naming matching PieceRenderer.ts and AssetManager.ts
const PIECE_NAMES: Record<string, Record<string, string>> = {
  w: {
    k: 'Luffy',
    q: 'Nami',
    b: 'Zoro',
    n: 'Sanji',
    r: 'Jimbei',
    p: 'Franky'
  },
  b: {
    k: 'Sengoku',
    q: 'Akainu',
    b: 'Kuzan',
    n: 'Kizaru',
    r: 'Fujitora',
    p: 'Marine'
  }
};

const getPieceCharacterName = (type: string, color: string) => {
  return PIECE_NAMES[color]?.[type] || '';
};

// Elegant, ultra-vibrant colored shadows representing dynamic powers!
const GLOW_SHADOWS: Record<string, Record<string, string>> = {
  w: {
    k: '0 0 16px rgba(255, 60, 60, 0.95), inset 0 0 6px rgba(255, 60, 60, 0.5)',     // Luffy (Red fire)
    q: '0 0 16px rgba(255, 145, 0, 0.95), inset 0 0 6px rgba(255, 145, 0, 0.5)',     // Nami (Orange sky)
    b: '0 0 16px rgba(46, 213, 115, 0.95), inset 0 0 6px rgba(46, 213, 115, 0.5)',   // Zoro (Green swords)
    n: '0 0 16px rgba(255, 215, 0, 0.95), inset 0 0 6px rgba(255, 215, 0, 0.5)',     // Sanji (Yellow kick)
    r: '0 0 16px rgba(30, 144, 255, 0.95), inset 0 0 6px rgba(30, 144, 255, 0.5)',   // Jinbei (Ocean blue)
    p: '0 0 16px rgba(0, 240, 255, 0.95), inset 0 0 6px rgba(0, 240, 255, 0.5)'      // Franky (Cyan machine)
  },
  b: {
    k: '0 0 18px rgba(212, 175, 55, 0.95), inset 0 0 6px rgba(212, 175, 55, 0.6)',   // Sengoku (Bright Buddha gold)
    q: '0 0 18px rgba(220, 10, 10, 0.95), inset 0 0 6px rgba(220, 10, 10, 0.6)',     // Akainu (Lava crimson)
    b: '0 0 18px rgba(130, 224, 255, 0.95), inset 0 0 6px rgba(130, 224, 255, 0.6)', // Kuzan (Glacier ice teal)
    n: '0 0 18px rgba(255, 255, 90, 0.95), inset 0 0 6px rgba(255, 255, 90, 0.6)',   // Kizaru (Yellow laser light)
    r: '0 0 18px rgba(157, 112, 230, 0.95), inset 0 0 6px rgba(157, 112, 230, 0.6)', // Fujitora (Purple gravity)
    p: '0 0 8px rgba(176, 196, 222, 0.7), inset 0 0 3px rgba(176, 196, 222, 0.3)'    // Marine (Navy steel silver)
  }
};

const getGlowShadow = (type: string, color: string) => {
  return GLOW_SHADOWS[color]?.[type] || '';
};
</script>

<style scoped>
.board-2d-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  max-width: 620px;
  max-height: 620px;
  margin: 0 auto;
  box-sizing: border-box;
}

.board-2d-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, #d4af37 0%, #aa8412 50%, #f1d592 100%);
  padding: 8px;
  border-radius: 16px;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.65), 0 0 30px rgba(212, 175, 55, 0.25);
  box-sizing: border-box;
}

.board-grid {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  background: #03080e;
  border-radius: 10px;
  overflow: hidden;
}

.square {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
}

/* Glassmorphism clear & dark ocean styling */
.square.light {
  background: rgba(226, 205, 161, 0.15);
  backdrop-filter: blur(8px);
}

.square.dark {
  background: rgba(10, 36, 68, 0.35);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.square:hover {
  background: rgba(212, 175, 55, 0.2);
}

/* Selected square glow ring */
.square.selected {
  outline: 3px solid #00d2ff !important;
  outline-offset: -3px;
  background: rgba(0, 210, 255, 0.15) !important;
  box-shadow: inset 0 0 15px rgba(0, 210, 255, 0.4);
  z-index: 2;
}

/* Move dots and target rings */
.move-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: rgba(46, 213, 115, 0.8);
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 0 0 8px rgba(46, 213, 115, 0.6);
  z-index: 4; /* Rendered on top of the piece token (z-index 3) so that capture rings overlay/surround perfectly */
}

.square.has-capture-move .move-indicator {
  width: 86%;
  height: 86%;
  background: transparent;
  border: 3.5px solid rgba(255, 71, 87, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(255, 71, 87, 0.7), inset 0 0 6px rgba(255, 71, 87, 0.4);
}

/* Coordinate labels styled small and gold */
.label-col {
  position: absolute;
  bottom: 2px;
  right: 4px;
  font-size: 0.65rem;
  color: rgba(212, 175, 55, 0.6);
  font-family: 'Cinzel', serif;
  font-weight: bold;
  pointer-events: none;
}

.label-row {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 0.65rem;
  color: rgba(212, 175, 55, 0.6);
  font-family: 'Cinzel', serif;
  font-weight: bold;
  pointer-events: none;
}

/* Piece token styled like premium metallic/carbon coin */
.piece-token {
  position: relative;
  width: 78%;
  height: 78%;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 3;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-sizing: border-box;
}

.piece-token:hover {
  transform: scale(1.1) translateY(-2px);
}

/* Straw Hat white pieces: Warm golden-ivory theme */
.piece-token.w {
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 40%, #c4a747 100%);
  border: 2px solid #d4af37;
  color: #1a0f00;
}

/* Marine black pieces: Dark slate-carbon theme */
.piece-token.b {
  background: linear-gradient(135deg, #2a3545 0%, #111823 45%, #050a12 100%);
  border: 2px solid rgba(212, 175, 55, 0.4);
  color: #ffffff;
}

.piece-portrait-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 1;
}

.piece-portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.piece-token:hover .piece-portrait {
  transform: scale(1.15);
}

/* Beautiful micro label for character names, overlaid premiumly as a tooltip */
.character-name {
  position: absolute;
  bottom: 110%; /* Float elegantly above the piece coin */
  left: 50%;
  transform: translateX(-50%) translateY(5px);
  opacity: 0;
  pointer-events: none;
  font-family: 'Cinzel', serif;
  font-size: 0.52rem;
  letter-spacing: 0.5px;
  font-weight: 900;
  text-transform: uppercase;
  max-width: 140%;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6), 0 0 10px rgba(212, 175, 55, 0.2);
  border-radius: 4px;
  padding: 3px 8px;
  text-align: center;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Tooltip arrow under the tooltip box */
.character-name::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
}

.piece-token.w .character-name::after {
  border-color: rgba(212, 175, 55, 0.8) transparent transparent transparent;
}

.piece-token.b .character-name::after {
  border-color: rgba(255, 255, 255, 0.3) transparent transparent transparent;
}

.piece-token.w .character-name {
  color: #ffd700; /* Gold text */
  background: rgba(10, 15, 25, 0.95); /* Dark background to pop over light portraits */
  border: 1px solid rgba(212, 175, 55, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
}

.piece-token.b .character-name {
  color: #ffffff; /* White text */
  background: rgba(5, 10, 20, 0.95); /* Deep dark background */
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
}

/* Render below for top row to prevent board clipping */
.top-row-grid .piece-token .character-name {
  bottom: auto;
  top: 110%;
  transform: translateX(-50%) translateY(-5px);
}

.top-row-grid .piece-token .character-name::after {
  top: auto;
  bottom: 100%;
  border-color: transparent transparent rgba(212, 175, 55, 0.8) transparent;
}

.top-row-grid .piece-token.b .character-name::after {
  border-color: transparent transparent rgba(255, 255, 255, 0.3) transparent;
}

/* Trigger visibility on Hover (Desktop) or when Selected (Mobile & Desktop) */
.piece-token:hover .character-name,
.square.selected .piece-token .character-name {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.top-row-grid .piece-token:hover .character-name,
.top-row-grid.selected .piece-token .character-name {
  transform: translateX(-50%) translateY(0);
}

/* Responsiveness overrides */
@media (max-width: 768px) {
  .piece-token {
    width: 82%;
    height: 82%;
  }
  
  /* On mobile/tablet, names only appear when selected, override hover triggers */
  .piece-token:hover .character-name {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  
  .top-row-grid .piece-token:hover .character-name {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }

  .square.selected .piece-token .character-name {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    font-size: 0.42rem;
    letter-spacing: 0px;
    padding: 2px 5px;
  }
  
  .top-row-grid.selected .piece-token .character-name {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    font-size: 0.42rem;
    letter-spacing: 0px;
    padding: 2px 5px;
  }
  .label-col, .label-row {
    font-size: 0.55rem;
  }
  .board-2d-frame {
    padding: 5px;
  }
  .board-grid {
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
  }
}
</style>
