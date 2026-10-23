document.addEventListener('DOMContentLoaded', () => {

 
  const header = document.getElementById('navbar-header');
  const menuBtn = document.getElementById('menu-btn');
  const navLinksList = document.getElementById('nav-links');
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section');

  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    
    let currentSectionId = 'home';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-sec') === currentSectionId) {
        item.classList.add('active');
      }
    });
  });

  
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    navLinksList.classList.toggle('active');
  });

  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      menuBtn.classList.remove('open');
      navLinksList.classList.remove('active');
    });
  });


 
  const swDisplay = document.getElementById('stopwatch-display');
  const swStartBtn = document.getElementById('stopwatch-start');
  const swLapBtn = document.getElementById('stopwatch-lap');
  const swResetBtn = document.getElementById('stopwatch-reset');
  const lapSection = document.getElementById('lap-section');
  const lapList = document.getElementById('lap-list');

  let stopwatchTimer = null;
  let stopwatchStartTime = 0;
  let stopwatchElapsedTime = 0;
  let isStopwatchRunning = false;
  let laps = [];

  function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  }

  function updateStopwatchDisplay() {
    const timeNow = Date.now();
    const totalElapsed = stopwatchElapsedTime + (timeNow - stopwatchStartTime);
    swDisplay.textContent = formatTime(totalElapsed);
  }

  swStartBtn.addEventListener('click', () => {
    if (!isStopwatchRunning) {
     
      isStopwatchRunning = true;
      stopwatchStartTime = Date.now();
      stopwatchTimer = setInterval(updateStopwatchDisplay, 10);
      
      swStartBtn.textContent = 'Pause';
      swStartBtn.classList.add('btn-outline');
      swStartBtn.classList.remove('btn-primary');
      swLapBtn.disabled = false;
    } else {
    
      isStopwatchRunning = false;
      clearInterval(stopwatchTimer);
      stopwatchElapsedTime += (Date.now() - stopwatchStartTime);
      
      swStartBtn.textContent = 'Start';
      swStartBtn.classList.remove('btn-outline');
      swStartBtn.classList.add('btn-primary');
      swLapBtn.disabled = true;
    }
  });

  swLapBtn.addEventListener('click', () => {
    if (isStopwatchRunning) {
      const currentLapTime = stopwatchElapsedTime + (Date.now() - stopwatchStartTime);
      laps.push(currentLapTime);
      
      
      lapSection.style.display = 'block';
      const lapItem = document.createElement('li');
      lapItem.className = 'lap-item';
      lapItem.innerHTML = `
        <span>Lap ${laps.length}</span>
        <span>${formatTime(currentLapTime)}</span>
      `;
      lapList.appendChild(lapItem);
      
      
      lapSection.scrollTop = lapSection.scrollHeight;
    }
  });

  swResetBtn.addEventListener('click', () => {
    isStopwatchRunning = false;
    clearInterval(stopwatchTimer);
    stopwatchElapsedTime = 0;
    laps = [];
    
    swDisplay.textContent = '00:00:00.00';
    swStartBtn.textContent = 'Start';
    swStartBtn.classList.remove('btn-outline');
    swStartBtn.classList.add('btn-primary');
    swLapBtn.disabled = true;
    
    lapList.innerHTML = '';
    lapSection.style.display = 'none';
  });


 
  const boardCells = document.querySelectorAll('.cell');
  const gameStatusText = document.getElementById('game-status');
  const resetGameBtn = document.getElementById('game-reset');
  const gameModeSelect = document.getElementById('game-mode');
  const aiDifficultySelect = document.getElementById('ai-difficulty');
  const scoreXVal = document.getElementById('score-x');
  const scoreDrawsVal = document.getElementById('score-draws');
  const scoreOVal = document.getElementById('score-o');

  let gameState = ['', '', '', '', '', '', '', '', ''];
  let gameActive = true;
  let currentPlayer = 'X'; 
  let scores = { X: 0, O: 0, draws: 0 };

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]            
  ];

  
  gameModeSelect.addEventListener('change', () => {
    if (gameModeSelect.value === 'ai') {
      aiDifficultySelect.style.display = 'block';
    } else {
      aiDifficultySelect.style.display = 'none';
    }
    resetGame();
  });

  aiDifficultySelect.addEventListener('change', resetGame);

 
  boardCells.forEach(cell => {
    cell.addEventListener('click', () => {
      const cellIndex = parseInt(cell.getAttribute('data-index'));
      
      if (gameState[cellIndex] !== '' || !gameActive) return;

      makeMove(cellIndex, currentPlayer);

      if (checkWin(currentPlayer)) {
        endGame(currentPlayer);
      } else if (checkDraw()) {     
        endGame('draw');
      } else {
       
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        gameStatusText.textContent = `Player ${currentPlayer}'s turn`;

        
        if (gameModeSelect.value === 'ai' && currentPlayer === 'O' && gameActive) {
          gameActive = false; 
          setTimeout(() => {
            triggerAIMove();
          }, 450); 
        }
      }
    });
  });

  function makeMove(index, player) {
    gameState[index] = player;
    const cell = boardCells[index];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
  }

  function checkWin(player) {
    return winningCombinations.some(combination => {
      return combination.every(index => gameState[index] === player);
    });
  }

  function checkDraw() {
    return gameState.every(cell => cell !== '');
  }

  function endGame(winner) {
    gameActive = false;
    if (winner === 'draw') {
      gameStatusText.textContent = "It's a draw!";
      scores.draws++;
      scoreDrawsVal.textContent = scores.draws;
    } else {
      gameStatusText.textContent = `Player ${winner} wins!`;
      if (winner === 'X') {
        scores.X++;
        scoreXVal.textContent = scores.X;
      } else {
        scores.O++;
        scoreOVal.textContent = scores.O;
      }
    }
  }

  function triggerAIMove() {
    const difficulty = aiDifficultySelect.value;
    let bestIndex;

    if (difficulty === 'easy') {
      // Random available space
      const availableIndices = [];
      gameState.forEach((val, idx) => {
        if (val === '') availableIndices.push(idx);
      });
      bestIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      // Unbeatable minimax algorithm
      bestIndex = getBestMoveMinimax();
    }

    if (bestIndex !== undefined) {
      gameActive = true; // Unlock before move
      makeMove(bestIndex, 'O');

      if (checkWin('O')) {
        endGame('O');
      } else if (checkDraw()) {
        endGame('draw');
      } else {
        currentPlayer = 'X';
        gameStatusText.textContent = "Player X's turn";
      }
    }
  }

  
  function getBestMoveMinimax() {
    let bestScore = -Infinity;
    let move;
    
    for (let i = 0; i < 9; i++) {
      if (gameState[i] === '') {
        gameState[i] = 'O'; 
        let score = minimax(gameState, 0, false);
        gameState[i] = ''; 
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  function minimax(board, depth, isMaximizing) {
    
    if (checkWinState(board, 'O')) return 10 - depth;
    if (checkWinState(board, 'X')) return depth - 10;
    if (board.every(cell => cell !== '')) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'O';
          let score = minimax(board, depth + 1, false);
          board[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'X';
          let score = minimax(board, depth + 1, true);
          board[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  
  function checkWinState(board, player) {
    return winningCombinations.some(combination => {
      return combination.every(index => board[index] === player);
    });
  }

  function resetGame() {
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    gameStatusText.textContent = "Player X's turn";
    
    boardCells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'cell';
    });
  }

  resetGameBtn.addEventListener('click', resetGame);


  
  const todoForm = document.getElementById('todo-form');
  const todoTitleInput = document.getElementById('todo-title');
  const todoDateTimeInput = document.getElementById('todo-datetime');
  const todoList = document.getElementById('todo-list');
  const filterBtns = document.querySelectorAll('.filter-btn');

  
  let tasks = JSON.parse(localStorage.getItem('sct_tasks')) || [];
  let currentFilter = 'all';

  function saveTasks() {
    localStorage.setItem('sct_tasks', JSON.stringify(tasks));
  }

  function renderTasks() {
    todoList.innerHTML = '';
    
    
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
      filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      filteredTasks = tasks.filter(t => t.completed);
    }

    
    filteredTasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (!a.datetime) return 1;
      if (!b.datetime) return -1;
      return new Date(a.datetime) - new Date(b.datetime);
    });

    if (filteredTasks.length === 0) {
      const emptyMsg = document.createElement('li');
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = 'var(--text-muted)';
      emptyMsg.style.padding = '20px';
      emptyMsg.style.fontSize = '14px';
      emptyMsg.textContent = 'No tasks found.';
      todoList.appendChild(emptyMsg);
      return;
    }

    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;
      
      
      let dateLabel = '';
      if (task.datetime) {
        const d = new Date(task.datetime);
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        dateLabel = d.toLocaleDateString('en-US', options);
      }

      li.innerHTML = `
        <div class="todo-left">
          <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" title="Toggle Complete">
          <div class="todo-details">
            <span class="todo-title">${escapeHTML(task.title)}</span>
            ${dateLabel ? `
              <span class="todo-datetime">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${dateLabel}
              </span>
            ` : ''}
          </div>
        </div>
        <div class="todo-actions">
          <button class="action-btn edit-btn" data-id="${task.id}" title="Edit Task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
          </button>
          <button class="action-btn delete-btn" data-id="${task.id}" title="Delete Task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      `;

      
      li.querySelector('.todo-checkbox').addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        toggleTaskComplete(id);
      });

      
      li.querySelector('.edit-btn').addEventListener('click', (e) => {
        const button = e.currentTarget;
        const id = parseInt(button.getAttribute('data-id'));
        editTask(id);
      });

      
      li.querySelector('.delete-btn').addEventListener('click', (e) => {
        const button = e.currentTarget;
        const id = parseInt(button.getAttribute('data-id'));
        deleteTask(id);
      });

      todoList.appendChild(li);
    });
  }

  
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = todoTitleInput.value.trim();
    const datetime = todoDateTimeInput.value;

    if (title === '') return;

    const newTask = {
      id: Date.now(),
      title: title,
      datetime: datetime,
      completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    
    todoTitleInput.value = '';
    todoDateTimeInput.value = '';
  });

  
  function toggleTaskComplete(id) {
    tasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    saveTasks();
    renderTasks();
  }

  
  function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newTitle = prompt('Edit your task title:', task.title);
    if (newTitle === null) return; 
    
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle === '') {
      alert('Task title cannot be empty.');
      return;
    }

    task.title = trimmedTitle;
    saveTasks();
    renderTasks();
  }

  
  function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
      tasks = tasks.filter(task => task.id !== id);
      saveTasks();
      renderTasks();
    }
  }

  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      renderTasks();
    });
  });

  
  renderTasks();

});
