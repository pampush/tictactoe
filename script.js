const eventEmitter = (function event() {
  let events = {};
  let last = undefined;

  let on = function(evt, handler) {
    (events[evt] || (events[evt] = [])).push(handler);
  }

  let emit = function(evt, ...arg) {
    last = evt;
    for(let item of events[evt])
      item(...arg);
  }

  let removeLastEventHandler = function() {
    events[last].pop(); // delete event[last]
  }
  
  let getEvents = function() {
    return {...events};
  }

  return {
    on,
    emit,
    removeLastEventHandler,
    getEvents
  }
})();

const gameBoard =
  (function createGameBoard() {
    let board = [],
        currentPlayer,
        boardSize;

    // game winner detection utility arrays
    let row = [0, 0, 0], col = [0, 0, 0], diag = 0, adiag = 0;

    function init(size, player) {
      boardSize = size; 
      board = Array(size * size); 
      currentPlayer = (player == 'x') ? true : false;
      /* for(let i = 0; i < size; i++)
        board[i] = Array(size); */ 
    }

    function winnerCheck(turn) {
      let c = turn % boardSize,
          r = Math.floor(turn / boardSize);
      
      if(currentPlayer) {
        row[r]++;
        col[c]++;
        if(r == c) diag++;
        if(r + c == boardSize - 1) adiag++; 
      }
      else {
        row[r]--;
        col[c]--;
        if(r == c) diag--;
        if(r + c == boardSize - 1) adiag--; 
      }

      if(row[r] == boardSize || col[c] == boardSize || diag == boardSize || adiag == boardSize) 
        eventEmitter.emit('displayWinner', 'x');
      if(row[r] == -boardSize || col[c] == -boardSize || diag == -boardSize || adiag == -boardSize) 
        eventEmitter.emit('displayWinner', 'o');
    }

    function switchPlayer(lastPlayer) {
      currentPlayer = !lastPlayer
    }

    return { 
      init,
      getBoard: () => board,
      winnerCheck,
      switchPlayer
    };
  })();

const player =
  (function createPlayer() {
    let name,
        score;

})();

const view =
  (function createView() {
    const boardCells = document.querySelectorAll('.game__cell');
    const boardContainer = document.querySelector('.game');
    let currentPlayer;
    function initPlayer(mark) {
      let currentPlayer = (mark == 'x') ? true : false;
      if(currentPlayer)
        boardContainer.classList.add(`game--x-turn`);
      else 
        boardContainer.classList.add(`game--circle-turn`);
    } 

    for(let item of boardCells)
      item.addEventListener('click', (e) => { 
        eventEmitter.emit('boardChange', e.target);
        eventEmitter.emit('playerChange', e.target.parentElement.classList.contains('game--x-turn') ? true : false) 
      }, 
        { once: true 
      });

    function markCell(node) {
      if(currentPlayer)
        node.classList.add('game__cell--icon-times')
      else
        node.classList.add('game__cell--icon-circle')
    } 

    function switchPlayer(lastPlayer) {
      currentPlayer = !lastPlayer;
      if(!currentPlayer) {
        boardContainer.classList.replace('game--x-turn', 'game--circle-turn')
      }  
      else {
        boardContainer.classList.replace('game--circle-turn', 'game--x-turn');
      }
    }

    function winnerDisplay(winner) {
      console.log(winner);
    }

    return {
      getBoardDOMElements: () => boardCells,
      markCell,
      switchPlayer,
      initPlayer,
      winnerDisplay,
      getBoardContainer: () => boardContainer,
      getCurrentPlayer: () => currentPlayer,
      setCurrentPlayer: (p) => currentPlayer = p
    }
  })();

const controller = 
(function createController() {  
  const boardInstance = Object.create(gameBoard);
  const viewInstance = Object.create(view);
  
  // FIXME: make it custom and random
  boardInstance.init(3, 'o');
  viewInstance.initPlayer('o');

  eventEmitter.on('boardChange', viewInstance.markCell);
  eventEmitter.on('boardChange', updateBoard);
  eventEmitter.on('boardChange', (elem) => boardInstance.winnerCheck(elem.dataset.id));
  eventEmitter.on('playerChange', viewInstance.switchPlayer);
  eventEmitter.on('playerChange', boardInstance.switchPlayer);
  eventEmitter.on('displayWinner', viewInstance.winnerDisplay);

  function updateBoard() {
    const b = viewInstance.getBoardDOMElements();
    for(let i = 0; i < b.length; i++) {
      if(b[i].classList.contains('game__cell--icon-times'))
        boardInstance.getBoard()[i] = 'x';
      else if(b[i].classList.contains('game__cell--icon-circle')) 
        boardInstance.getBoard()[i] = 'o';
      else
        boardInstance.getBoard()[i] = '';
    }
  } 

  // function switchPlayer() {
  //   boardInstance.currentPlayer = ''
  // }
})();

module.exports = { gameBoard, player, view, controller };