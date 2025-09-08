<template>
  <div v-if="launch" class="next-launch-card">
    <div class="launch-header">
      <h2>🚀 Próximo Lanzamiento</h2>
      <div class="countdown">{{ launch.countdown }}</div>
    </div>

    <div class="launch-content">
      <div class="mission-info">
        <h3>{{ launch.mission }}</h3>
        <div class="launch-details">
          <div class="detail">
            <span class="label">Rocket:</span>
            <span class="value">{{ launch.rocket }}</span>
          </div>
          <div class="detail">
            <span class="label">Date:</span>
            <span class="value">{{ formatDate(launch.date) }}</span>
          </div>
          <div class="detail">
            <span class="label">Status:</span>
            <span class="value status" :class="getStatusClass(launch.status)">
              {{ launch.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="launch-visual">
        <div class="rocket-icon">🚀</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  launch: {
    mission: string;
    rocket: string;
    date: string;
    status: string;
    countdown: string;
  } | null;
}>();

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("go")) return "status-go";
  if (statusLower.includes("tbd")) return "status-tbd";
  return "status-unknown";
}
</script>

<style scoped>
.next-launch-card {
  background: linear-gradient(135deg, #7c4dff 0%, #ff58b0 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(124, 77, 255, 0.3);
}

.launch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.launch-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.countdown {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1.1rem;
  backdrop-filter: blur(10px);
}

.launch-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mission-info h3 {
  font-size: 1.8rem;
  margin-bottom: 16px;
  font-weight: 700;
}

.launch-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail {
  display: flex;
  gap: 12px;
}

.label {
  font-weight: 500;
  opacity: 0.8;
  min-width: 60px;
}

.value {
  font-weight: 600;
}

.status-go {
  color: #4ade80;
}

.status-tbd {
  color: #fbbf24;
}

.status-unknown {
  color: #94a3b8;
}

.launch-visual {
  font-size: 4rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .launch-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .launch-details {
    align-items: center;
  }

  .launch-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
