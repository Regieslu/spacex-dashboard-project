<template>
  <main style="padding: 16px; max-width: 1100px; margin: 0 auto">
    <!-- Loading global -->
    <div v-if="spacexStore.isLoading" style="text-align: center; padding: 40px">
      <p>Cargando datos de SpaceX...</p>
    </div>

    <!-- Error global -->
    <div
      v-else-if="spacexStore.error"
      style="color: red; text-align: center; padding: 40px"
    >
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
main {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

section {
  margin-bottom: 32px;
}

section h2 {
  color: #eceff1;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel {
  padding: 16px;
  color: #e5e7eb;
}

h1 {
  font-size: 20px;
  margin-bottom: 8px;
}

button {
  background: #ff58b0;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
}

button:hover {
  background: #ff83c4;
}

@media (max-width: 768px) {
  main {
    padding: 16px;
  }

  section {
    margin-bottom: 24px;
  }

  section h2 {
    font-size: 1.25rem;
  }
  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
}
</style>
