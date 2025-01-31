<script>
  import TodoForm from "./TodoForm.svelte";
  import { onMount } from "svelte";

  let tasks = [];
  let selectedTask = null;
  let showForm = false;

  onMount(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      tasks = JSON.parse(storedTasks);
    }
  });

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function openForm(task = null) {
    selectedTask = task;
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    selectedTask = null;
  }

  function saveTask(event) {
    const task = event.detail;
    if (selectedTask) {
      tasks = tasks.map(t => (t === selectedTask ? task : t));
    } else {
      tasks = [...tasks, task];
    }
    saveTasks();
    closeForm();
  }

  function deleteTask(event) {
    const task = event.detail;
    tasks = tasks.filter(t => t !== task);
    saveTasks();
    closeForm();
  }
</script>

<div class="container mt-5">
  <div class="card shadow-sm">
    <div class="card-body">
      <h1 class="text-primary text-center mb-4">📌 Ma To-Do List</h1>
      <button class="btn btn-success w-100 mb-3" on:click={() => openForm()}>➕ Ajouter une tâche</button>
      
      <ul class="list-group">
        {#each tasks as task}
          <li class="list-group-item d-flex justify-content-between align-items-center shadow-sm" on:click={() => openForm(task)}>
            <span class="fw-bold">{task.text}</span> 
            {#if task.status=="nouveau"}
              <span class="badge bg-info text-dark">{task.status}</span>
            {/if}
            {#if task.status=="en cours"}
              <span class="badge bg-danger text-dark">{task.status}</span>
            {/if}
            {#if task.status=="fait"}
              <span class="badge bg-success text-dark">{task.status}</span>
            {/if}
          </li>



        {/each}
      </ul>
    </div>
  </div>
</div>

{#if showForm}
  <TodoForm {selectedTask} on:save={saveTask} on:delete={deleteTask} on:close={closeForm} />
{/if}
