
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");
const timerDisplay = document.getElementById("timer");
const modeButtons = document.querySelectorAll("[data-mode]");
const progressRing = document.querySelector('.progress-ring__circle');

let interval = null;
let timeLeft = parseInt(localStorage.getItem("timeLeft")) || 1500;
let currentMode = localStorage.getItem("currentMode") || "work";
let initialTime = parseInt(localStorage.getItem("initialTime")) || 1500;

const MODES = {
  work: 1500,
  short: 300,
  long: 900
};

const RING_COLORS = {
  work: '#2EC4B6',
  short: '#FF9F1C', 
  long: '#9C6ADE'
};

const radius = 86;
const circumference = 2 * Math.PI * radius;
progressRing.style.strokeDasharray = circumference;
progressRing.style.strokeDashoffset = 0;

// Pomodoro Timer Code
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const progress = (initialTime - timeLeft) / initialTime;
  const offset = circumference - (progress * circumference);
  progressRing.style.strokeDashoffset = offset;

  localStorage.setItem("timeLeft", timeLeft);
  localStorage.setItem("currentMode", currentMode);
  localStorage.setItem("initialTime", initialTime);
}

function startTimer() {
  if (interval) return;
  interval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft === 0) {
      clearInterval(interval);
      interval = null;
      alert("Time's up!");
      timeLeft = MODES[currentMode];
      initialTime = MODES[currentMode];
      updateTimerDisplay();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
  interval = null;
}

function resetTimer() {
  clearInterval(interval);
  interval = null;
  timeLeft = MODES[currentMode];
  initialTime = MODES[currentMode];
  updateTimerDisplay();
}

function switchMode(mode) {
  currentMode = mode;
  timeLeft = MODES[mode];
  initialTime = MODES[mode];
  updateTimerDisplay();
  stopTimer();
  progressRing.style.stroke = RING_COLORS[mode];
  modeButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.mode === mode)
  );
}

startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);
modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchMode(btn.dataset.mode));
});
progressRing.style.stroke = RING_COLORS[currentMode];
updateTimerDisplay();

// Notes functionality with localStorage
const notesTextarea = document.getElementById('notes-textarea');
notesTextarea.value = localStorage.getItem('savedNotes') || "";
notesTextarea.addEventListener('input', function() {
  localStorage.setItem('savedNotes', notesTextarea.value);
});

// Todo App Code
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');
let allTodos = JSON.parse(localStorage.getItem("allTodos")) || [];

const checkboxColors = ['#00A896', '#FF9F1C', '#9C6ADE'];

function saveTodos() {
  localStorage.setItem("allTodos", JSON.stringify(allTodos));
}

function addTodo(){
  const todoText = todoInput.value.trim();
  if(todoText.length > 0){
    const todoObject = {
      text: todoText,
      completed: false
    }
    allTodos.push(todoObject);
    updateTodoList();
    todoInput.value = "";
    saveTodos();
  }
}

function updateTodoList(){
  todoListUL.innerHTML = "";
  allTodos.forEach((todo, todoIndex) => {
    const todoItem = createTodoItem(todo, todoIndex);
    todoListUL.append(todoItem);
  });
}

function createTodoItem(todo, todoIndex){
  const todoId = "todo-"+todoIndex;
  const todoLI = document.createElement("li");
  const todoText = todo.text;
  const colorIndex = todoIndex % checkboxColors.length;
  const checkboxColor = checkboxColors[colorIndex];
  todoLI.className = "todo";
  todoLI.innerHTML = `
    <input type="checkbox" id="${todoId}">
    <label class="custom-checkbox" for="${todoId}" style="border-color: ${checkboxColor}; background-color: ${todo.completed ? checkboxColor : 'transparent'};"></label>
    <label for="${todoId}" class="todo-text">${todoText}</label>
    <button class="delete-button"></button>
  `;
  const deleteButton = todoLI.querySelector(".delete-button");
  deleteButton.addEventListener("click", () => {
    deleteTodoItems(todoIndex);
  });
  const checkbox = todoLI.querySelector("input");
  checkbox.addEventListener("change", () => {
    allTodos[todoIndex].completed = checkbox.checked;
    const customCheckbox = todoLI.querySelector(".custom-checkbox");
    customCheckbox.style.backgroundColor = checkbox.checked ? checkboxColor : 'transparent';
    saveTodos();
  });
  checkbox.checked = todo.completed;
  return todoLI; 
}

function deleteTodoItems(todoIndex){
  allTodos = allTodos.filter((_, i) => i !== todoIndex);
  updateTodoList();
  saveTodos();
}

// Ensure form submit doesn't refresh page and adds todo
todoForm.addEventListener("submit", function(e) {
  e.preventDefault();
  addTodo();
});

// Initialize todo list on page load
updateTodoList();