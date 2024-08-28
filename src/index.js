import "./styles.css";

const new_project = document.getElementById('new_project');
const projects = document.getElementById('projects');
const project_dialog = document.getElementById('project_dialog');
const task_dialog = document.getElementById('task_dialog');
const close_project_dialog = document.getElementById('close_project_dialog');
const close_task_dialog = document.getElementById('close_task_dialog');
const project_name = document.getElementById('project_name');
const today = new Date().toISOString().split('T')[0];
const task_name = document.getElementById('task_name');
const task_description = document.getElementById('task_description');
const due_date = document.getElementById('due_date');
const option = document.getElementById('option');
const catalog = document.getElementById('catalog');
const edit_dialog = document.getElementById('edit_dialog');
const edit_name = document.getElementById('edit_name');
const edit_description = document.getElementById('edit_description');
const edit_date = document.getElementById('edit_date');
const edit_option = document.getElementById('edit_option');
const save_edit_task = document.getElementById('save_edit_task');

document.getElementById('due_date').setAttribute('min', today);

const myProjects = loadProjectsFromStorage();
let currentProjectIndex = null;
let currentTaskIndex = null;

function Project(name) {
  this.name = name;
  this.tasks = [];
}

function Task(name, description, date, option) {
  this.name = name;
  this.description = description;
  this.date = date;
  this.option = option;
}

function saveProjectsToStorage() {
  localStorage.setItem('myProjects', JSON.stringify(myProjects));
}

function loadProjectsFromStorage() {
  const projects = localStorage.getItem('myProjects');
  const projectArray = projects ? JSON.parse(projects) : [];

  const defaultProjectExists = projectArray.some(project => project.name === 'My First Project');

  if (!defaultProjectExists) {
    const defaultProject = new Project('My First Project');

    const defaultTask = new Task('Task', 'Description', today, 'yes');
    defaultProject.tasks.push(defaultTask);

    projectArray.push(defaultProject);
    
    localStorage.setItem('myProjects', JSON.stringify(projectArray));
  }

  return projectArray;
}

function createProject(name) {
  const newProject = new Project(name);
  myProjects.push(newProject);
  saveProjectsToStorage();
  displayProjects();
}

function createTask(name, description, date, option) {
  const newTask = new Task(name, description, date, option);

  if (currentProjectIndex !== null && myProjects[currentProjectIndex]) {
    myProjects[currentProjectIndex].tasks.push(newTask);
    saveProjectsToStorage();
    displayProjects();
    displayTasks(currentProjectIndex);
  }
}

function displayProjects() {
  projects.innerHTML = '';

  myProjects.forEach((project, index) => {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'card';
    projectDiv.innerHTML = `
      <div class="action">
        <h2>${project.name}</h2>
        <div>
            <button class="new_todo">+</button>
            <button class="del_list">x</button>
        </div>      
      </div>
      <div class="listing">
        <ul class="todo"></ul>
      </div>
    `;

    projectDiv.querySelector('.action').addEventListener('click', () => {
      displayTasks(index);
    });

    projectDiv.querySelector('.del_list').addEventListener('click', () => {
      deleteProject(index);
    });

    projectDiv.querySelector('.new_todo').addEventListener('click', () => {
      currentProjectIndex = index;
      task_dialog.showModal();
    });

    const todo = projectDiv.querySelector('.todo');
    project.tasks.forEach((task) => {
      const todo_task = document.createElement('li');
      todo_task.innerText = `${task.name}`;
      todo.appendChild(todo_task);
    });

    projects.appendChild(projectDiv);
  });
}

function deleteProject(index) {
  myProjects.splice(index, 1);
  saveProjectsToStorage();
  displayProjects();
}

function displayTasks(project_index) {
  catalog.innerHTML = '';
  const taskList = myProjects[project_index].tasks;
  taskList.forEach((task, task_index) => {
    const task_card = document.createElement('div');
    task_card.id = 'task';
    task_card.innerHTML = `
      <div class="text_card">
        <h3>${task.name}</h3>
        <h4>${task.description}</h4>
        <h5>${task.date}</h5>
      </div>
      <div>
        <button class="edit">✎</button>
        <button class="del_task">x</button>
      </div>
    `;
    if (task.option === 'yes') {
      task_card.className = 'important';
    }

    task_card.querySelector('.del_task').addEventListener('click', () => {
      deleteTask(project_index, task_index);
    });

    task_card.querySelector('.edit').addEventListener('click', () => {
      currentProjectIndex = project_index;
      currentTaskIndex = task_index;
      edit_dialog.showModal();
      loadEditTask(project_index, task_index);
    });

    catalog.appendChild(task_card);
  });
}

function deleteTask(project_index, task_index) {
  myProjects[project_index].tasks.splice(task_index, 1);
  saveProjectsToStorage();
  displayTasks(project_index);
  displayProjects();
}

function loadEditTask(project_index, task_index) {
  const task = myProjects[project_index].tasks[task_index];
  edit_name.value = task.name;
  edit_description.value = task.description;
  edit_date.value = task.date;
  edit_option.value = task.option;
}

save_edit_task.addEventListener('click', () => {
  const name = edit_name.value.trim();
  const description = edit_description.value.trim();
  const date = edit_date.value.trim();
  const important = edit_option.value.trim();

  if (!name || !description || !date || !important) {
    alert("Please fill all fields.");
  } else {
    myProjects[currentProjectIndex].tasks[currentTaskIndex].name = name;
    myProjects[currentProjectIndex].tasks[currentTaskIndex].description = description;
    myProjects[currentProjectIndex].tasks[currentTaskIndex].date = date;
    myProjects[currentProjectIndex].tasks[currentTaskIndex].option = important;

    saveProjectsToStorage();
    displayTasks(currentProjectIndex);
    displayProjects();
    edit_dialog.close();
  }
});

new_project.addEventListener('click', () => {
  project_dialog.showModal();
});

close_project_dialog.addEventListener('click', (e) => {
  if (project_name.value.trim() === '') {
    project_name.focus();
    e.preventDefault();
  } else {
    createProject(project_name.value);
    project_dialog.close();
    project_name.value = '';
  }
});

close_task_dialog.addEventListener('click', (e) => {
  const name = task_name.value.trim();
  const description = task_description.value.trim();
  const date = due_date.value.trim();
  const important = option.value.trim();

  if (!name || !description || !date || !important) {
    task_name.focus();
    e.preventDefault();
  } else {
    createTask(name, description, date, important);
    task_dialog.close();
    task_name.value = '';
    task_description.value = '';
    due_date.value = '';
    option.value = 'yes';
  }
});

displayProjects();

const defaultProjectIndex = myProjects.findIndex(project => project.name === 'My First Project');
if (defaultProjectIndex !== -1) {
  displayTasks(defaultProjectIndex);
}
