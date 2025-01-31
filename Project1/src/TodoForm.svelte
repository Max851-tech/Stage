<script>
    import { createEventDispatcher } from "svelte";
  
    export let selectedTask = null;
    let text = selectedTask ? selectedTask.text : "";
    let status = selectedTask ? selectedTask.status : "nouveau";
  
    const dispatch = createEventDispatcher();
  
    function save() {
      dispatch("save", { text, status });
    }
  
    function deleteTask() {
      dispatch("delete", selectedTask);
    }
  
    function close() {
      dispatch("close");
    }
  </script>
  
  <div class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow-lg">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">{selectedTask ? "Modifier la tâche" : "Nouvelle tâche"}</h5>
          <button type="button" class="btn-close" on:click={close}></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Titre de la tâche</label>
            <input class="form-control" type="text" bind:value={text} placeholder="Entrez un titre" />
          </div>
          <div class="mb-3">
            <label class="form-label">Statut</label>
            <select class="form-select" bind:value={status}>
              <option value="nouveau">Nouveau</option>
              <option value="en cours">En cours</option>
              <option value="fait">Fait</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          {#if selectedTask}
            <button class="btn btn-danger" on:click={deleteTask}>🗑 Supprimer</button>
          {/if}
          <button class="btn btn-success" on:click={save}>💾 Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
  
  <style>
    .modal {
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
  