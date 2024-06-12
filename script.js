document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskTitle = document.getElementById('task-title');
  const taskDesc = document.getElementById('task-desc');
  const pendingTaskList = document.getElementById('pending-task-list');
  const inProgressTaskList = document.getElementById('in-progress-task-list');
  const completedTaskList = document.getElementById('completed-task-list');

  const apiUrl = 'http://localhost:3000/api/tasks';

  // Função para buscar tarefas que chamo a todo momento para o dinamismo  da tela
  const fetchTasks = async () => {
    const response = await fetch(apiUrl);
    const tasks = await response.json();
    pendingTaskList.innerHTML = '';
    inProgressTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.classList.add('task-item', task.completed ? 'completed' : (task.inProgress ? 'in-progress' : 'pending'));
      li.dataset.id = task.id;

      const contentDiv = document.createElement('div');
      contentDiv.classList.add('content');

      const titleSpan = document.createElement('span');
      titleSpan.textContent = task.title;
      titleSpan.classList.add('task-title');
      
      const descSpan = document.createElement('span');
      descSpan.textContent = `: ${task.description}`;
      descSpan.classList.add('task-desc');

      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('task-actions');

      const devButton = document.createElement('button');
      devButton.classList.add('button', 'is-small', 'is-light');
      devButton.textContent = 'ToDev';
      devButton.addEventListener('click', () => inProgressTask(task.title, task.description, task.id, !task.inProgress));

      const completeButton = document.createElement('button');
      completeButton.classList.add('button', 'is-small', task.completed ? 'is-success' : 'is-light');
      completeButton.textContent = '✔';
      completeButton.addEventListener('click', () => completeTask(task.title, task.description, task.id, !task.completed, !task.inProgress));

      const editButton = document.createElement('button');
      editButton.classList.add('button', 'is-small', 'is-info');
      editButton.textContent = 'Editar';
      editButton.addEventListener('click', () => editTask(task.id, task.title, task.description));

      const deleteButton = document.createElement('button');
      deleteButton.classList.add('button', 'is-small', 'is-danger');
      deleteButton.textContent = 'X';
      deleteButton.addEventListener('click', () => deleteTask(task.id));

      actionsDiv.appendChild(devButton);
      actionsDiv.appendChild(completeButton);
      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);

      contentDiv.appendChild(titleSpan);
      contentDiv.appendChild(descSpan);

      li.appendChild(contentDiv);
      li.appendChild(actionsDiv);



      // laço condidional que permite termos um fluxo de trafego coeso das tarefas dentre as colunas
      if (task.completed && task.inProgress) {
        completedTaskList.appendChild(li);
        actionsDiv.removeChild(completeButton);
      } else if (task.inProgress) {
        inProgressTaskList.appendChild(li);
        actionsDiv.removeChild(devButton);
      } else if (task.completed) {
        completedTaskList.appendChild(li);
        actionsDiv.removeChild(completeButton);
      } else {
        pendingTaskList.appendChild(li);
        actionsDiv.removeChild(completeButton); 
      }
    });
  };

  // Adiciona uma nova tarefa
  const addTask = async (title, description) => {
    const task = { title, description };
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });

    if (response.ok) {
      fetchTasks();
    }
  };

  // Coloca a tarefa na coluna de desenvolvimento
  const inProgressTask = async (title, description, id, inProgress) => {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, inProgress })
    });

    if (response.ok) {
      fetchTasks();
    }
  };

  // Coloca a task como done
  const completeTask = async (title, description, id, completed, inProgress) => {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, completed, id, inProgress})
    });

    if (response.ok) {
      fetchTasks();
    }
  };

// Função chamada quando vamos editar uma tarefa
const editTask = async (id, currentTitle, currentDescription) => {
  const popup = document.getElementById('popup');
  const editDescription = document.getElementById('edit-description');

  // Abertura do popup de edição da descrição
  popup.style.display = 'block';
  editDescription.value = currentDescription;

  // Metodo chamado para salvar a descrição editada
  const saveButton = document.getElementById('save-edit');
  saveButton.addEventListener('click', async () => {
    const updatedDescription = editDescription.value;
    popup.style.display = 'none';

    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: currentTitle, description: updatedDescription, completed: false })
    });

    if (response.ok) {
      fetchTasks();
    }
  });

  // Cancelando popup de edição
  const cancelButton = document.getElementById('cancel-edit');
  cancelButton.addEventListener('click', () => {
    popup.style.display = 'none';
  });
};


  // Deletar uma tarefa do board
  const deleteTask = async (id) => {
    const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });

    if (response.ok) {
      fetchTasks();
    }
  };

  // Metodo para a criação das tarefas após preenchimento no board
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitle.value.trim();
    const description = taskDesc.value.trim();

    if (title !== '' && description !== '') {
      addTask(title, description);
      taskTitle.value = '';
      taskDesc.value = '';
    }
  });

  fetchTasks();
});
