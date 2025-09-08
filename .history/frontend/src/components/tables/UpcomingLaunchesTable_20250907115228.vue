<template>
  <div class="table-container">
    <table class="upcoming-table">
      <thead>
        <tr>
          <th>Mission</th>
          <th>Rocket</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
          <th>Launchpad</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="launch in launches" :key="launch.mission">
          <td class="mission-name">{{ launch.mission }}</td>
          <td>{{ launch.rocket }}</td>
          <td>{{ launch.date }}</td>
          <td>{{ launch.time }}</td>
          <td>
            <span class="status-badge" :class="getStatusClass(launch.status)">
              {{ launch.status }}
            </span>
          </td>
          <td>{{ launch.launchpad }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  launches: Array<{
    mission: string;
    rocket: string;
    date: string;
    time: string;
    status: string;
    launchpad: string;
  }>;
}>();

function getStatusClass(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("go")) return "status-go";
  if (statusLower.includes("tbd")) return "status-tbd";
  return "status-unknown";
}
</script>

<style scoped>
.table-container {
  background: #161a20;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #263238;
}

.upcoming-table {
  width: 100%;
  border-collapse: collapse;
}

.upcoming-table th {
  background: #1e2329;
  color: #eceff1;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.upcoming-table td {
  padding: 16px;
  color: #b0bec5;
  border-top: 1px solid #263238;
}

.upcoming-table tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.mission-name {
  font-weight: 600;
  color: #eceff1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-go {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.status-tbd {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.status-unknown {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

@media (max-width: 768px) {
  .table-container {
    overflow-x: auto;
  }

  .upcoming-table {
    min-width: 600px;
  }
}
</style>
