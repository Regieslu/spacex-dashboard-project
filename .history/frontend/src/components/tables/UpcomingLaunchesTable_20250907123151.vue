<template>
  <div class="table-container">
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

    <table v-else class="upcoming-table">
      <thead>
        <tr>
          <th>Mission</th>
          <th>Rocket</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
          <th>Launchpad</th>
          <th>Countdown</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="launch in launches" :key="launch.id">
          <td class="mission-name">{{ launch.name || "TBD" }}</td>
          <td>{{ getRocketName(launch.rocket) }}</td>
          <td>{{ formatDate(launch.date_utc) }}</td>
          <td>{{ formatTime(launch.date_utc) }}</td>
          <td>
            <span
              class="status-badge"
              :class="getStatusClass(launch.status?.name)"
            >
              {{ launch.status?.name || "TBD" }}
            </span>
          </td>
          <td>{{ getLaunchpadName(launch.launchpad) }}</td>
          <td class="countdown">{{ getCountdown(launch.date_utc) }}</td>
        </tr>
      </tbody>
    </table>
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
function formatDate(dateString: string): string {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateString: string): string {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function getRocketName(rocket: any): string {
  if (typeof rocket === "string") {
    // Si es un ID, buscar en rockets store
    const rocketData = spacexStore.rockets.find((r) => r.id === rocket);
    return rocketData?.name || "Unknown";
  }
  return rocket?.name || "Unknown";
}

function getLaunchpadName(launchpad: any): string {
  if (typeof launchpad === "string") {
    // Si es un ID, podríamos buscar en launchpads si tuviéramos ese endpoint
    return "Unknown";
  }
  return launchpad?.name || "Unknown";
}

function getStatusClass(status: string): string {
  if (!status) return "status-unknown";

  const statusLower = status.toLowerCase();
  if (statusLower.includes("go")) return "status-go";
  if (statusLower.includes("tbd") || statusLower.includes("tentative"))
    return "status-tbd";
  if (statusLower.includes("success")) return "status-success";
  if (statusLower.includes("fail")) return "status-fail";
  return "status-unknown";
}

function getCountdown(dateString: string): string {
  if (!dateString) return "TBD";

  const now = new Date();
  const launchDate = new Date(dateString);
  const diff = launchDate.getTime() - now.getTime();

  if (diff <= 0) return "Launched";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
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
