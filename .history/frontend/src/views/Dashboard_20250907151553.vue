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
import { backgrounds } from "../assets/theme";

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

  // Calcular lanzamientos de este año
  const currentYear = new Date().getFullYear();
  const launchesThisYear = launches.filter(
    (l) => new Date(l.date_utc).getFullYear() === currentYear
  ).length;

  // Determinar el mensaje para el cambio
  const getYearlyChangeMessage = () => {
    if (launchesThisYear === 0) {
      return "No launches this year";
    } else if (launchesThisYear === 1) {
      return "1 launch this year";
    } else {
      return `${launchesThisYear} launches this year`;
    }
  };

  return [
    {
      title: "Total Launches",
      value: totalLaunches.toString(),
      change: getYearlyChangeMessage(),
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
  // Cargar solo los datos específicos del dashboard
  await spacexStore.fetchForView('dashboard');
});

const retryLoad = async () => {
  spacexStore.clearCache();
  await spacexStore.fetchForView('dashboard');
};
</script>
<style scoped>
.dashboard {
  padding: 24px;
  min-height: 100vh;
  background: v-bind("backgrounds.card");
}

.dashboard-header {
  text-align: center;
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #eceff1;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: #b0bec5;
  font-size: 1.1rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #eceff1;
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

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.kpi-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.next-launch-section {
  margin-bottom: 8px;
}

.upcoming-launches-section h2,
.mini-chart-section h2 {
  color: #eceff1;
  margin-bottom: 16px;
  font-size: 1.5rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .kpi-section {
    grid-template-columns: 1fr;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }
}
</style>
