<template>
  <section class="panel">
    <!-- Loading state -->
    <div v-if="spacexStore.isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando datos de Starlink...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="spacexStore.error" class="error-state">
      <p>Error: {{ spacexStore.error }}</p>
      <button @click="retryLoad" class="retry-btn">Reintentar</button>
    </div>

    <!-- Content -->
    <StarLinkGlobe v-else />
  </section>
</template>
<script setup lang="ts">
import StarLinkGlobe from "../components/starlink/StarLinkGlobe.vue";
import { useSpacexStore } from "../stores/useSpacexStore";
import { onMounted } from "vue";

const spacexStore = useSpacexStore();

onMounted(async () => {
  // Cargar todos los datos de una vez
  await spacexStore.fetchAllData();
});

const retryLoad = async () => {
  spacexStore.clearCache();
  await spacexStore.fetchAllData();
};
</script>
<style scoped>
.panel {
  padding: 16px;
  color: #e5e7eb;
}
</style>
