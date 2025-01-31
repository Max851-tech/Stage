<script>
  import Todo from "./Todo.svelte";
  import "bootstrap/dist/css/bootstrap.min.css"; // Contient tout la déclaration de style que je vais utiliser après
  import "bootstrap/dist/js/bootstrap.bundle.min.js"; // quand j'utilise les classes pour faire les menus qui se déplient 
</script>

<main class="d-flex vh-100 justify-content-center align-items-center bg-light">
  <Todo />
</main>

<style>
  body {
    margin: 0;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  }
</style>
