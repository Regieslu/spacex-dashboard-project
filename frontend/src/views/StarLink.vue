<template>
  <section class="panel">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <LoadingSpinner
        :message="loadingMessage"
        size="large"
        :full-screen="true"
      />
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="error-container">
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
    <div v-else class="dashboard">
      <div class="dashboard-section">
        <div class="grid grid-2">
          <div class="card">
            <StarLinkGlobe />
          </div>
          <div class="card">
            <StarlinkLaunchTimeline />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import StarLinkGlobe from "../components/starlink/StarLinkGlobe.vue";
import StarlinkLaunchTimeline from "../components/starlink/StarlinkLaunchTimeline.vue";
import LoadingSpinner from "../components/ui/LoadingSpinner.vue";
import ErrorMessage from "../components/ui/ErrorMessage.vue";
import { useSpacexStore } from "../stores/useSpacexStore";
import { onMounted, computed } from "vue";

const spacexStore = useSpacexStore();

// Estados de loading y error mejorados
const isLoading = computed(() => {
  return spacexStore.loadingStates.starlink.isLoading;
});

const loadingMessage = computed(() => {
  return spacexStore.loadingStates.starlink.loadingMessage;
});

const hasError = computed(() => {
  return !!spacexStore.errors.starlink;
});

const errorTitle = computed(() => {
  return "Error loading Starlink data";
});

const errorMessage = computed(() => {
  return spacexStore.errors.starlink?.message || "Unknown error";
});

const errorDetails = computed(() => {
  return spacexStore.errors.starlink
    ? JSON.stringify(spacexStore.errors.starlink.details, null, 2)
    : "";
});

onMounted(async () => {
  // Cargar solo los datos que realmente necesitan ser actualizados
  await spacexStore.loadStarlinkData();
});

const retryLoad = async () => {
  spacexStore.clearCache();
  await spacexStore.loadStarlinkData();
};
</script>
<style scoped>
.panel {
  padding: 16px;
  color: #e5e7eb;
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

/* Dashboard Styles */
.dashboard {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-section {
  margin-bottom: 30px;
}

.grid {
  display: grid;
  gap: 20px;
}

.grid-2 {
  grid-template-columns: 1fr 1fr;
}

.card {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 12px;
  border: 1px solid #333333;
  overflow: hidden;
}

@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 12px;
  }
}
</style>
