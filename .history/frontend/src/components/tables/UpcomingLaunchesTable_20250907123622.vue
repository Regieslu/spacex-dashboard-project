<template>
  <div class="spacex-table-container">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando próximos lanzamientos...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>Error: {{ error }}</p>
      <button @click="retryLoad" class="retry-btn">Reintentar</button>
    </div>

    <div v-else-if="launches.length === 0" class="empty-state">
      <p>No hay lanzamientos próximos disponibles</p>
    </div>

    <div v-else class="spacex-table-wrapper">
      <h2 class="table-title">UPCOMING LAUNCHES</h2>
      <table class="spacex-table">
        <thead>
          <tr>
            <th>MISSION</th>
            <th>VEHICLE</th>
            <th>LAUNCH SITE</th>
            <th>LANDING SITE</th>
            <th>LAUNCH DATE AND TIME</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="launch in launches" :key="launch.id">
            <td class="mission-cell">{{ launch.name || "TBD" }}</td>
            <td class="vehicle-cell">{{ getRocketName(launch.rocket) }}</td>
            <td class="launch-site-cell">{{ getLaunchSite(launch.launchpad) }}</td>
            <td class="landing-site-cell">{{ getLandingSite(launch.cores) }}</td>
            <td class="date-time-cell">{{ formatDateTime(launch.date_utc) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useSpacexStore } from "../../stores/useSpacexStore";

const spacexStore = useSpacexStore();

// Props para datos externos si se necesitan
const props = defineProps<{
  launches?: any[];
}>();

// Usar datos de la store o props
const launches = computed(() => {
  return props.launches || spacexStore.upcomingLaunches;
});

const isLoading = computed(() => spacexStore.isLoading);
const error = computed(() => spacexStore.error);

// Watch para actualizar cuando cambien los datos
watch(
  () => spacexStore.upcomingLaunches,
  (newLaunches) => {
    // Los datos se actualizan automáticamente por reactividad
  },
  { deep: true }
);

const retryLoad = async () => {
  spacexStore.clearCache();
  await spacexStore.fetchUpcomingLaunches();
};

// Helper functions
function formatDateTime(dateString: string): string {
  if (!dateString) return "TBD";
  
  const date = new Date(dateString);
  const month = date.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  
  // Calcular ventana de tiempo (asumiendo ±1 hora)
  const windowStart = new Date(date.getTime() - 60 * 60 * 1000);
  const windowEnd = new Date(date.getTime() + 60 * 60 * 1000);
  
  const timeStart = windowStart.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const timeEnd = windowEnd.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  
  return `${month} ${day}, ${year} ${timeStart} - ${timeEnd} CST`;
}

function getRocketName(rocket: any): string {
  if (typeof rocket === "string") {
    // Si es un ID, buscar en rockets store
    const rocketData = spacexStore.rockets.find((r) => r.id === rocket);
    return rocketData?.name || "UNKNOWN";
  }
  return rocket?.name || "UNKNOWN";
}

function getLaunchSite(launchpad: any): string {
  if (typeof launchpad === "string") {
    // Mapear IDs conocidos de launchpads
    const launchpadMap: { [key: string]: string } = {
      "5e9e4501f509094ba4566f84": "SLC-40, FLORIDA",
      "5e9e4502f509092b78566f87": "SLC-4E, CALIFORNIA",
      "5e9e4502f509094188566f88": "SLC-4W, CALIFORNIA",
      "5e9e4502f5090995de566f86": "SLC-40, FLORIDA",
      "5e9e4502f509092b78566f87": "SLC-4E, CALIFORNIA"
    };
    return launchpadMap[launchpad] || "UNKNOWN";
  }
  return launchpad?.name || "UNKNOWN";
}

function getLandingSite(cores: any[]): string {
  if (!cores || cores.length === 0) return "UNKNOWN";
  
  const core = cores[0];
  if (!core) return "UNKNOWN";
  
  // Determinar tipo de aterrizaje basado en core data
  if (core.landing_type === "ASDS") {
    return "DRONESHIP";
  } else if (core.landing_type === "RTLS") {
    return "LANDING ZONE";
  } else if (core.landing_type === "Ocean") {
    return "OCEAN";
  }
  
  return "UNKNOWN";
}
</script>

<style scoped>
.table-container {
  background: #161a20;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #263238;
  min-height: 200px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #eceff1;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #263238;
  border-top: 3px solid #ff58b0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
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
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
}

.retry-btn:hover {
  background: #ff83c4;
}

.upcoming-table {
  width: 100%;
  border-collapse: collapse;
}

.upcoming-table th {
  background: #1e2329;
  color: #eceff1;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #263238;
}

.upcoming-table td {
  padding: 12px;
  color: #b0bec5;
  border-top: 1px solid #263238;
  font-size: 0.9rem;
}

.upcoming-table tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.mission-name {
  font-weight: 600;
  color: #eceff1;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-go {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
}

.status-tbd {
  background: rgba(255, 183, 77, 0.2);
  color: #ffb74d;
}

.status-success {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
}

.status-fail {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.status-unknown {
  background: rgba(176, 190, 197, 0.2);
  color: #b0bec5;
}

.countdown {
  font-family: "Courier New", monospace;
  font-weight: 600;
  color: #00e5ff;
  font-size: 0.85rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .table-container {
    overflow-x: auto;
  }

  .upcoming-table {
    min-width: 700px;
  }

  .upcoming-table th,
  .upcoming-table td {
    padding: 8px 6px;
    font-size: 0.8rem;
  }

  .mission-name {
    max-width: 150px;
  }
}

@media (max-width: 480px) {
  .upcoming-table {
    min-width: 600px;
  }

  .upcoming-table th,
  .upcoming-table td {
    padding: 6px 4px;
    font-size: 0.75rem;
  }
}
</style>
