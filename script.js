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
      li.classList.add('task-item');
      li.dataset.id = task.id;

      const titleSpan = document.createElement('span');
      titleSpan.textContent = task.title;
      titleSpan.classList.add('task-title');
      
      const descSpan = document.createElement('span');
      descSpan.textContent = `: ${task.description}`;
      descSpan.classList.add('task-desc');

      const completeButton = document.createElement('button');
      completeButton.textContent = task.completed ? 'Desmarcar' : '✔';
      completeButton.addEventListener('click', () => completeTask(task.id, !task.completed));

      const editButton = document.createElement('button');
      editButton.textContent = 'Editar';
      editButton.addEventListener('click', () => editTask(task.id, task.title, task.description));

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      deleteButton.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(titleSpan);
      li.appendChild(descSpan);
      li.appendChild(completeButton);
      li.appendChild(editButton);
      li.appendChild(deleteButton);

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
  const completeTask = async (id, completed) => {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });

    if (response.ok) {
      fetchTasks();
    }
  };

  // Função para editar uma tarefa
  const editTask = async (id, currentTitle, currentDescription) => {
    const newDescription = prompt('Nova descrição:', currentDescription);

    if (newDescription !== null) { // Permitir que o usuário possa cancelar a edição
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: currentTitle, description: newDescription, completed: false })
      });

      if (response.ok) {
        fetchTasks();
      }
    }
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
