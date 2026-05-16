import { GameLoop } from './game/GameLoop.js';
import { UIManager } from './ui/UIManager.js';
import { NetworkManager } from './network/NetworkManager.js';

const networkManager = new NetworkManager();
const game = new GameLoop(networkManager);
const ui = new UIManager(game);

// Main.js now just sets up the managers, UIManager starts the game.