<template>
  <div class="shell">
    <div class="main-area">
      <Navbar />
      <main class="content">
        <!-- Vue router inyecta la vista actual -->
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from "./Navbar.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";
const route = useRoute();
const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/launches-rockets": "Launches & Rockets",
  "/starlink": "Starlink",
};
</script>

<style scoped>
/* modo oscuro */
.shell {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100%;
  height: 100%;
  background: #0f1116;
}
/* main area navBar arriba y contenido abajo */
.main-area {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.content {
  flex: 1;
  min-width: 0;
  background: #000000;
}
</style>
