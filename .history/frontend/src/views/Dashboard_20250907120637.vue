<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <h1>🚀 SpaceX Dashboard</h1>
      <p>Real-time mission data and launch information</p>
    </header>

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

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- KPI Cards -->
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

      <!-- Next Launch Hero -->
      <!-- <section class="next-launch-section" v-if="nextLaunch">
        <NextLaunchCard :launch="nextLaunch" />
      </section> -->

      <!-- Upcoming Launches Table -->
      <section class="upcoming-launches-section">
        <h2>📅 Próximos Lanzamientos</h2>
        <UpcomingLaunchesTable :launches="upcomingLaunches" />
      </section>

      <!-- Mini Chart -->
      <!-- <section class="mini-chart-section">
        <h2>📈 Lanzamientos por Mes</h2>
        <MiniLaunchesChart :data="launchesData" />
      </section> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useSpacexStore } from "../stores/useSpacexStore";
import KPICard from "../components/cards/KPICard.vue";
import NextLaunchCard from "../components/cards/NextLaunchCard.vue";
import UpcomingLaunchesTable from "../components/tables/UpcomingLaunchesTable.vue";
import MiniLaunchesChart from "../components/charts/MiniLaunchesChart.vue";

const spacexStore = useSpacexStore();

// Computed para KPIs
const kpis = computed(() => {
  const launches = spacexStore.launches;
  const rockets = spacexStore.rockets;
  const starlink = spacexStore.starlink;

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

// Computed para próximo lanzamiento
const nextLaunch = computed(() => {
  const launches = spacexStore.launches;
  const upcoming = launches
    .filter((l) => l.upcoming)
    .sort(
      (a, b) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime()
    )[0];

  if (!upcoming) return null;

  return {
    mission: upcoming.name,
    rocket: upcoming.rocket?.name || "Unknown",
    date: upcoming.date_utc,
    status: upcoming.status?.name || "TBD",
    launchpad: upcoming.launchpad?.name || "Unknown",
    countdown: getCountdown(upcoming.date_utc),
  };
});

// Computed para próximos lanzamientos
const upcomingLaunches = computed(() => {
  return spacexStore.launches
    .filter((l) => l.upcoming)
    .sort(
      (a, b) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime()
    )
    .slice(0, 10)
    .map((launch) => ({
      mission: launch.name,
      rocket: launch.rocket?.name || "Unknown",
      date: new Date(launch.date_utc).toLocaleDateString(),
      time: new Date(launch.date_utc).toLocaleTimeString(),
      status: launch.status?.name || "TBD",
      launchpad: launch.launchpad?.name || "Unknown",
    }));
});

// Computed para mini chart
const launchesData = computed(() => {
  const launches = spacexStore.launches;
  const last6Months = launches
    .filter((l) => {
      const launchDate = new Date(l.date_utc);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return launchDate >= sixMonthsAgo;
    })
    .reduce((acc, launch) => {
      const month = new Date(launch.date_utc).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(last6Months).map(([month, count]) => ({
    month,
    count,
  }));
});

onMounted(async () => {
  await spacexStore.fetchAllData();
});

const retryLoad = async () => {
  spacexStore.clearCache();
  await spacexStore.fetchAllData();
};

function getCountdown(dateString: string): string {
  const now = new Date();
  const launchDate = new Date(dateString);
  const diff = launchDate.getTime() - now.getTime();

  if (diff <= 0) return "Launched";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days}d ${hours}h ${minutes}m`;
}
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
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
