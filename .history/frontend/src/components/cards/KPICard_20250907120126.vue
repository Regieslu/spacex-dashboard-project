<template>
  <div class="kpi-card" :class="`kpi-card--${color}`">
    <div class="kpi-icon">{{ icon }}</div>
    <div class="kpi-content">
      <h3 class="kpi-title">{{ title }}</h3>
      <div class="kpi-value">{{ value }}</div>
      <div class="kpi-change">{{ change }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  value: string;
  change: string;
  icon: string;
  color: "success" | "info" | "primary" | "warning";
}>();
</script>

<style scoped>
.kpi-card {
  background: #161a20;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #263238;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.kpi-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.kpi-card--success .kpi-icon {
  background: rgba(129, 199, 132, 0.2);
}

.kpi-card--info .kpi-icon {
  background: rgba(0, 229, 255, 0.2);
}

.kpi-card--primary .kpi-icon {
  background: rgba(255, 88, 176, 0.2);
}

.kpi-card--warning .kpi-icon {
  background: rgba(255, 183, 77, 0.2);
}

.kpi-content {
  flex: 1;
}

.kpi-title {
  color: #b0bec5;
  font-size: 0.9rem;
  margin-bottom: 4px;
  font-weight: 500;
}

.kpi-value {
  color: #eceff1;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.kpi-change {
  color: #90a4ae;
  font-size: 0.8rem;
}
</style>
