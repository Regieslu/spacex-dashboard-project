<script setup lang="ts">
import LaunchesCombo from "../components/charts/LaunchesByMonth.vue";
import LaunchesStackedPretty from "../components/charts/LaunchesStackedStatus.vue";
import RocketsRadar from "../components/charts/RocketsRadar.vue";
import LoadingSpinner from "../components/ui/LoadingSpinner.vue";
import ErrorMessage from "../components/ui/ErrorMessage.vue";
import { useSpacexStore } from "../stores/useSpacexStore";
import { onMounted, computed } from "vue";

const spacexStore = useSpacexStore();

// Estados de loading y error mejorados
const isAnyLoading = computed(() => {
  const states = spacexStore.loadingStates;
  return states.launches.isLoading || states.rockets.isLoading;
});

const loadingMessage = computed(() => {
  const states = spacexStore.loadingStates;
  if (states.launches.isLoading) return states.launches.loadingMessage;
  if (states.rockets.isLoading) return states.rockets.loadingMessage;
  return 'Cargando datos de lanzamientos y cohetes...';
});

const hasAnyError = computed(() => {
  const errors = spacexStore.errors;
  return errors.launches || errors.rockets;
});

const errorTitle = computed(() => {
  const errors = spacexStore.errors;
  if (errors.launches) return 'Error al cargar lanzamientos';
  if (errors.rockets) return 'Error al cargar cohetes';
  return 'Error en datos de lanzamientos y cohetes';
});

const errorMessage = computed(() => {
  const errors = spacexStore.errors;
  if (errors.launches) return errors.launches.message;
  if (errors.rockets) return errors.rockets.message;
  return 'Error desconocido';
});

const errorDetails = computed(() => {
  const errors = spacexStore.errors;
  const error = errors.launches || errors.rockets;
  return error ? JSON.stringify(error.details, null, 2) : '';
});

onMounted(async () => {
  // Cargar solo los datos que realmente necesitan ser actualizados
  await spacexStore.loadLaunchesRocketsData();
});

const retryLoad = async () => {
  spacexStore.clearCache();
  await spacexStore.loadLaunchesRocketsData();
};
</script>
<template>
  <section class="panel">
    <!-- Loading State -->
    <div v-if="isAnyLoading" class="loading-container">
      <LoadingSpinner 
        :message="loadingMessage" 
        size="large" 
        :full-screen="true" 
      />
    </div>

    <!-- Error State -->
    <div v-else-if="hasAnyError" class="error-container">
      <ErrorMessage
        :title="errorTitle"
        :message="errorMessage"
        :details="errorDetails"
        :full-screen="true"
        :show-retry="true"
        @retry="retryLoad"
      />
    </div>

    <!-- Main Content -->
    <div v-else class="grid">
      <div class="card"><LaunchesCombo /></div>
      <div class="card"><LaunchesStackedPretty /></div>
      <div class="card" style="grid-column: 1 / -1"><RocketsRadar /></div>
    </div>
  </section>
</template>
<style scoped>
.panel {
  padding: 16px;
  color: #e5e7eb;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #eceff1;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #263238;
  border-top: 3px solid #ff58b0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.retry-btn {
  background: #ff58b0;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
}

.retry-btn:hover {
  background: #ff83c4;
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
