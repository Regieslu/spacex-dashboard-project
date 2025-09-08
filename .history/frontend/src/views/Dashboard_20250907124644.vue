<template>
  <main class="dashboard">
    <!-- Loading global -->
    <div v-if="spacexStore.isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando datos de SpaceX...</p>
    </div>

    <!-- Error global -->
    <div v-else-if="spacexStore.error" class="error-state">
      <p>Error: {{ spacexStore.error }}</p>
      <button @click="retryLoad" class="retry-btn">Reintentar</button>
    </div>
      <p>Error: {{ spacexStore.error }}</p>
      <button @click="retryLoad">Reintentar</button>
    </div>
    <div v-else class="dashboard-content">
      <section class="kpi-section">
        <KPICard
          v-for="kpi in kpis"
          :key="kpi.title"
          :title="kpi.title"
          :value="kpi.value"
          :change="kpi.change"
          :icon="kpi.icon"
          :color="kpi.color"
        />
      </section>
      <!-- Upcoming Launches Section -->
      <section>
        <UpcomingLaunchesTable />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import KPICard from "../components/cards/KPICard.vue";
import UpcomingLaunchesTable from "../components/tables/UpcomingLaunchesTable.vue";
import { useSpacexStore } from "../stores/useSpacexStore";
import { onMounted, computed } from "vue";

const spacexStore = useSpacexStore();

const kpis = computed(() => {
  const launches = spacexStore.launches;
  const rockets = spacexStore.rockets;
  const starlink = spacexStore.starlink;
  const upcomingLaunches = spacexStore.upcomingLaunches;
  const totalLaunches = launches.length;
  const successfulLaunches = launches.filter((l) => l.success).length;
  const successRate =
    totalLaunches > 0
      ? ((successfulLaunches / totalLaunches) * 100).toFixed(1)
      : 0;
  const activeRockets = rockets.filter((r) => r.active).length;
  const starlinkCount = starlink.length;
  return [
    {
      title: "Total Launches",
      value: totalLaunches.toString(),
      change: `+${
        launches.filter(
          (l) => new Date(l.date_utc).getFullYear() === new Date().getFullYear()
        ).length
      } this year`,
      icon: "🚀",
      color: "primary",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      change: "Industry leading",
      icon: "✅",
      color: "success",
    },
    {
      title: "Active Rockets",
      value: activeRockets.toString(),
      change: rockets
        .filter((r) => r.active)
        .map((r) => r.name)
        .join(", "),
      icon: "🛰️",
      color: "info",
    },
    {
      title: "Starlink Satellites",
      value: starlinkCount.toLocaleString(),
      change: "Global coverage",
      icon: "🛰️",
      color: "warning",
    },
  ];
});

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
  .dashboard {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    min-height: 100vh;
  }
  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
}
</style>
