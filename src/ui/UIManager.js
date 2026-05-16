export class UIManager {
  constructor(gameLoop) {
    this.gameLoop = gameLoop;
    this.mode = 'menu'; // menu, lobby, game
    this.pendingMode = null; // 'single' or 'multi'
    this.selectedShip = 'galleon';

    // Screens
    this.homeScreen = document.getElementById('home-screen');
    this.shipSelectionScreen = document.getElementById('ship-selection-screen');
    this.lobbyScreen = document.getElementById('lobby-screen');
    this.gameUi = document.getElementById('game-ui');
    this.tip = document.getElementById('tip');
    this.crosshair = document.getElementById('crosshair');

    // Home buttons
    this.btnSingleplayer = document.getElementById('btn-singleplayer');
    this.btnMultiplayer = document.getElementById('btn-multiplayer');
    this.btnBackToHome = document.getElementById('btn-back-to-home');

    // Ship selection buttons
    this.shipBtns = document.querySelectorAll('.ship-btn');

    // Lobby elements
    this.lobbyOptions = document.getElementById('lobby-options');
    this.roomWaiting = document.getElementById('room-waiting');
    this.btnCreateRoom = document.getElementById('btn-create-room');
    this.btnJoinRoom = document.getElementById('btn-join-room');
    this.btnLobbyBack = document.getElementById('btn-lobby-back');
    this.btnLeaveRoom = document.getElementById('btn-leave-room');
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnCopyCode = document.getElementById('btn-copy-code');
    this.inputRoomCode = document.getElementById('input-room-code');
    this.displayRoomCode = document.getElementById('display-room-code');

    // Game elements
    this.gameTitle = document.getElementById('game-title');
    this.gameHint = document.getElementById('game-hint');

    this.bindEvents();
  }

  bindEvents() {
    this.btnSingleplayer.addEventListener('click', (e) => {
      e.target.blur();
      this.pendingMode = 'single';
      this.showScreen(this.shipSelectionScreen);
    });

    this.btnMultiplayer.addEventListener('click', (e) => {
      e.target.blur();
      this.pendingMode = 'multi';
      this.showScreen(this.shipSelectionScreen);
    });

    this.btnBackToHome.addEventListener('click', (e) => {
      e.target.blur();
      this.showScreen(this.homeScreen);
    });

    this.shipBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.blur();
        this.selectedShip = btn.dataset.ship;
        if (this.pendingMode === 'single') {
          this.startGame(false);
        } else {
          this.showScreen(this.lobbyScreen);
          this.lobbyOptions.classList.remove('hidden');
          this.roomWaiting.classList.add('hidden');
        }
      });
    });

    this.btnLobbyBack.addEventListener('click', (e) => {
      e.target.blur();
      this.showScreen(this.shipSelectionScreen);
    });

    this.btnCreateRoom.addEventListener('click', async (e) => {
      e.target.blur();
      if (!this.gameLoop.networkManager) return;
      const res = await this.gameLoop.networkManager.createRoom();
      if (res.success) {
        this.displayRoomCode.textContent = res.roomId;
        this.lobbyOptions.classList.add('hidden');
        this.roomWaiting.classList.remove('hidden');
        this.btnStartGame.style.display = 'block'; // Host can start
      } else {
        alert('Could not connect to multiplayer server. Please ensure you are running the game via http://localhost:3000 and the Node server is running.');
      }
    });

    this.btnJoinRoom.addEventListener('click', async () => {
      if (!this.gameLoop.networkManager) return;
      const code = this.inputRoomCode.value.trim().toUpperCase();
      if (code.length === 4) {
        const res = await this.gameLoop.networkManager.joinRoom(code);
        if (res.success) {
          this.displayRoomCode.textContent = code;
          this.lobbyOptions.classList.add('hidden');
          this.roomWaiting.classList.remove('hidden');
          this.btnStartGame.style.display = 'none'; // Guest cannot start initially
          
          // In a simple MVP, just start game automatically for both when joined
          this.startGame(true);
        } else {
          alert('Room not found or error joining.');
        }
      }
    });

    this.btnLeaveRoom.addEventListener('click', () => {
      if (this.gameLoop.networkManager) {
        this.gameLoop.networkManager.disconnect();
        this.gameLoop.networkManager.connect(); // reconnect to get new socket
      }
      this.lobbyOptions.classList.remove('hidden');
      this.roomWaiting.classList.add('hidden');
    });

    this.btnStartGame.addEventListener('click', () => {
      // Host clicks start
      if (this.gameLoop.networkManager) {
        this.gameLoop.networkManager.socket.emit('startGame');
      }
      this.startGame(true);
    });

    this.btnCopyCode.addEventListener('click', () => {
      navigator.clipboard.writeText(this.displayRoomCode.textContent);
      this.btnCopyCode.textContent = 'Copied!';
      setTimeout(() => this.btnCopyCode.textContent = 'Copy Code', 2000);
    });

    // Listen for host starting the game (if we are guest)
    document.addEventListener('networkStartGame', () => {
      this.startGame(true);
    });
  }

  showScreen(screen) {
    this.homeScreen.classList.add('hidden');
    this.shipSelectionScreen.classList.add('hidden');
    this.lobbyScreen.classList.add('hidden');
    this.gameUi.classList.add('hidden');
    
    screen.classList.remove('hidden');
  }

  startGame(isMultiplayer) {
    this.mode = 'game';
    this.showScreen(this.gameUi);
    this.tip.classList.remove('hidden');
    this.crosshair.style.display = 'block';
    
    // Fade background of game ui
    this.gameUi.style.background = 'none';
    this.gameUi.style.backdropFilter = 'none';

    this.setGameUi('Sea of Tides', isMultiplayer ? 'Multiplayer Mode - Sail with WASD' : 'WASD to sail • Space = anchor');
    
    // Clicking anywhere in the game UI requests pointer lock
    document.body.addEventListener('click', () => {
      if (this.mode === 'game') {
        this.gameLoop.input.requestPointerLock();
      }
    });

    this.gameLoop.startGame(isMultiplayer, this.selectedShip);
  }

  setGameUi(title, hint) {
    this.gameTitle.textContent = title;
    this.gameHint.textContent = hint;
  }
}
