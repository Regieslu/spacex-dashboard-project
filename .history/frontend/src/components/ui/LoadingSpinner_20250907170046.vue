<template>
  <div class="loading-spinner-container" :class="{ 'full-screen': fullScreen }">
    <div class="loading-spinner" :class="size">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

withDefaults(defineProps<Props>(), {
  message: "Cargando...",
  size: "medium",
  fullScreen: false,
});
</script>

<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-spinner-container.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
}

.loading-spinner {
  position: relative;
  display: inline-block;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
}

.loading-spinner.medium {
  width: 40px;
  height: 40px;
}

.loading-spinner.large {
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  border: 2px solid transparent;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small .spinner-ring {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.loading-spinner.medium .spinner-ring {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.loading-spinner.large .spinner-ring {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.2s;
  border-top-color: #00d4ff;
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.4s;
  border-top-color: #ff6b35;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-message {
  margin-top: 16px;
  color: #ffffff;
  font-family: "Space Mono", monospace;
  font-size: 14px;
  text-align: center;
  opacity: 0.8;
}

.loading-spinner-container.full-screen .loading-message {
  font-size: 16px;
  margin-top: 24px;
}
</style>
