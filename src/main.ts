import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // Use WebGL if available, otherwise Canvas
  width: 800,
  height: 600,
  parent: 'game-container', // ID of the div to inject the canvas into
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 }, // Standard gravity
      debug: false // Set to true for collision debugging
    }
  },
  scene: [PreloadScene, GameScene] // Add your scenes here
};

// Ensure the div exists in your HTML or Phaser will create one
// If you don't specify a parent, Phaser appends the canvas to the body
document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    const newDiv = document.createElement('div');
    newDiv.id = 'game-container';
    document.body.appendChild(newDiv);
  }
  (window as any)['__PHASER_GAME__'] = new Phaser.Game(config);
});