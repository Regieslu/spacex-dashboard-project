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
            <td class="launch-site-cell">
              {{ getLaunchSite(launch.launchpad) }}
            </td>
            <td class="landing-site-cell">
              {{ getLandingSite(launch.cores) }}
            </td>
            <td class="date-time-cell">
              {{ formatDateTime(launch.date_utc) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useSpacexStore } from "../../stores/useSpacexStore";
import { typography } from "../../assets/theme";

const spacexStore = useSpacexStore();

// Props para datos externos si se necesitan
const props = defineProps<{
  launches?: any[];
}>();

// Usar datos de la store o props
const launches = computed(() => {
  const data = props.launches || spacexStore.upcomingLaunches;
  // Limitar a solo los primeros 3 resultados
  return data.slice(0, 3);
});

const isLoading = computed(() => spacexStore.isLoading);
const error = computed(() => spacexStore.error);

// Cargar datos si no están disponibles
onMounted(async () => {
  if (spacexStore.upcomingLaunches.length === 0) {
    await spacexStore.fetchUpcomingLaunches();
  }
});

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
  const month = date
    .toLocaleDateString("en-US", { month: "long" })
    .toUpperCase();
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Calcular ventana de tiempo (asumiendo ±1 hora)
  const windowStart = new Date(date.getTime() - 60 * 60 * 1000);
  const windowEnd = new Date(date.getTime() + 60 * 60 * 1000);

  const timeStart = windowStart.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const timeEnd = windowEnd.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
      "5e9e4502f509092b78566f87": "SLC-4E, CALIFORNIA",
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
.spacex-table-container {
  background: #000000;
  color: #ffffff;
  font-family: "Courier New", "Monaco", "Menlo", monospace;
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
  color: #ffffff;
  text-align: center;
  background: #000000;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #333333;
  border-top: 3px solid #ffffff;
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
  background: #ffffff;
  color: #000000;
  border: none;
  padding: 8px 16px;
  border-radius: 0;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  font-family: "Courier New", monospace;
}

.retry-btn:hover {
  background: #cccccc;
}

.spacex-table-wrapper {
  background: #000000;
  padding: 0;
}

.table-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 20px 0;
  padding: 20px 0 0 0;
  font-family: "Courier New", "Monaco", "Menlo", monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.spacex-table {
  width: 100%;
  border-collapse: collapse;
  background: #000000;
  color: #ffffff;
  font-family: "Courier New", "Monaco", "Menlo", monospace;
}

.spacex-table th {
  background: #000000;
  color: #ffffff;
  padding: 16px 20px;
  text-align: left;
  font-weight: normal;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #333333;
  font-family: "Courier New", "Monaco", "Menlo", monospace;
}

.spacex-table td {
  padding: 16px 20px;
  color: #ffffff;
  border-bottom: 1px solid #333333;
  font-size: 0.9rem;
  font-family: "Courier New", "Monaco", "Menlo", monospace;
  vertical-align: top;
}

.spacex-table tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.mission-cell {
  font-weight: normal;
  color: #ffffff;
  max-width: 300px;
  line-height: 1.4;
}

.vehicle-cell {
  color: #ffffff;
  font-weight: normal;
}

.launch-site-cell {
  color: #ffffff;
  font-weight: normal;
}

.landing-site-cell {
  color: #ffffff;
  font-weight: normal;
}

.date-time-cell {
  color: #ffffff;
  font-weight: normal;
  white-space: nowrap;
  min-width: 250px;
}

/* Responsive design */
@media (max-width: 1024px) {
  .spacex-table {
    font-size: 0.8rem;
  }

  .spacex-table th,
  .spacex-table td {
    padding: 12px 16px;
  }

  .date-time-cell {
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .spacex-table-container {
    overflow-x: auto;
  }

  .spacex-table {
    min-width: 800px;
    font-size: 0.75rem;
  }

  .spacex-table th,
  .spacex-table td {
    padding: 10px 12px;
  }

  .mission-cell {
    max-width: 200px;
  }

  .date-time-cell {
    min-width: 180px;
  }
}

@media (max-width: 480px) {
  .spacex-table {
    min-width: 700px;
    font-size: 0.7rem;
  }

  .spacex-table th,
  .spacex-table td {
    padding: 8px 10px;
  }

  .mission-cell {
    max-width: 150px;
  }

  .date-time-cell {
    min-width: 160px;
  }
}
</style>
