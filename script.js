document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskTitle = document.getElementById('task-title');
  const taskDesc = document.getElementById('task-desc');
  const pendingTaskList = document.getElementById('pending-task-list');
  const completedTaskList = document.getElementById('completed-task-list');

  const apiUrl = 'http://localhost:3000/api/tasks';

  // Função para buscar tarefas
  const fetchTasks = async () => {
    const response = await fetch(apiUrl);
    const tasks = await response.json();
    pendingTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.classList.add('task-item', task.completed ? 'completed' : 'pending');
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

      const completeButton = document.createElement('button');
      completeButton.classList.add('button', 'is-small', task.completed ? 'is-success' : 'is-light');
      completeButton.textContent = task.completed ? 'Desmarcar' : '✔';
      completeButton.addEventListener('click', () => completeTask(task.title, task.description, task.id, !task.completed));

      const editButton = document.createElement('button');
      editButton.classList.add('button', 'is-small', 'is-info');
      editButton.textContent = 'Editar';
      editButton.addEventListener('click', () => editTask(task.id, task.title, task.description));

      const deleteButton = document.createElement('button');
      deleteButton.classList.add('button', 'is-small', 'is-danger');
      deleteButton.textContent = 'X';
      deleteButton.addEventListener('click', () => deleteTask(task.id));

      actionsDiv.appendChild(completeButton);
      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);

      contentDiv.appendChild(titleSpan);
      contentDiv.appendChild(descSpan);

      li.appendChild(contentDiv);
      li.appendChild(actionsDiv);

      if (task.completed) {
        completedTaskList.appendChild(li);
      } else {
        pendingTaskList.appendChild(li);
      }
    });
  };

  // Função para adicionar uma nova tarefa
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

  // Função para marcar uma tarefa como concluída
  const completeTask = async (title, description, id, completed) => {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, completed, id})
    });

    if (response.ok) {
      fetchTasks();
    }
  };

// Função para editar uma tarefa
const editTask = async (id, currentTitle, currentDescription) => {
  const popup = document.getElementById('popup');
  const editDescription = document.getElementById('edit-description');

  // Exibe o popup
  popup.style.display = 'block';
  editDescription.value = currentDescription;

  // Evento para salvar a edição
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

  // Evento para cancelar a edição
  const cancelButton = document.getElementById('cancel-edit');
  cancelButton.addEventListener('click', () => {
    popup.style.display = 'none';
  });
};


  // Função para deletar uma tarefa
  const deleteTask = async (id) => {
    const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });

    if (response.ok) {
      fetchTasks();
    }
  };

  // Evento de submit do formulário
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

  // Inicializar lista de tarefas
  fetchTasks();
});
