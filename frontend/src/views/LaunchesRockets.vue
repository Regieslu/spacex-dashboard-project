<script setup lang="ts">
import LaunchesCombo from "../components/charts/LaunchesByMonth.vue";
import LaunchesStackedPretty from "../components/charts/LaunchesStackedStatus.vue";
import RocketsRadar from "../components/charts/RocketsRadar.vue";
import LoadingSpinner from "../components/ui/LoadingSpinner.vue";
import ErrorMessage from "../components/ui/ErrorMessage.vue";
import { useSpacexStore } from "../stores/useSpacexStore";
import { onMounted, computed } from "vue";
import LandingSuccessDonutChart from "../components/charts/LandingSuccessDonutChart.vue";
import FlightNumberScatter from "../components/charts/FlightNumberScatter.vue";
import LaunchesByYearChart from "../components/charts/LaunchesByYearChart.vue";

const spacexStore = useSpacexStore();

const isAnyLoading = computed(() => {
  const states = spacexStore.loadingStates;
  return states.launches.isLoading || states.rockets.isLoading;
});

const loadingMessage = computed(() => {
  const states = spacexStore.loadingStates;
  if (states.launches.isLoading) return states.launches.loadingMessage;
  if (states.rockets.isLoading) return states.rockets.loadingMessage;
  return "Loading launches and rockets data...";
});

const hasAnyError = computed(() => {
  const errors = spacexStore.errors;
  return errors.launches || errors.rockets;
});

const errorTitle = computed(() => {
  const errors = spacexStore.errors;
  if (errors.launches) return "Error loading launches";
  if (errors.rockets) return "Error loading rockets";
  return "Error loading launches and rockets data";
});

const errorMessage = computed(() => {
  const errors = spacexStore.errors;
  if (errors.launches) return errors.launches.message;
  if (errors.rockets) return errors.rockets.message;
  return "Unknown error";
});

const errorDetails = computed(() => {
  const errors = spacexStore.errors;
  const error = errors.launches || errors.rockets;
  return error ? JSON.stringify(error.details, null, 2) : "";
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
    <div class="dashboard">
      <section class="dashboard-section">
        <div class="grid grid-2">
          <div class="card"><LandingSuccessDonutChart /></div>
          <div class="card"><RocketsRadar /></div>
        </div>
      </section>
      <!-- Detailed Analysis Section -->
      <section class="dashboard-section">
        <div>
          <div class="card"><LaunchesByYearChart /></div>
        </div>
      </section>
    </div>
  </section>
</template>
<style scoped>
.panel {
  padding: 16px;
  color: #e5e7eb;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grid {
  display: grid;
  gap: 16px;
}

/* Grid layouts */
.grid-1 {
  grid-template-columns: 1fr;
}

.grid-2 {
  grid-template-columns: 1fr;
}

.grid-3 {
  grid-template-columns: 1fr;
}

.card {
  background: #000000;
  border-radius: 12px;
  border: 1px solid #263238;
  overflow: hidden;
  min-height: 300px;
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

/* Responsive Design */
@media (min-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr 1fr;
  }

  .grid-3 {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1200px) {
  .grid-3 {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .dashboard {
    gap: 32px;
  }

  .dashboard-section {
    gap: 20px;
  }
}

@media (min-width: 1600px) {
  .panel {
    padding: 24px;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>
