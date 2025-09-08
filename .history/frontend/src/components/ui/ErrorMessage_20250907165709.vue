<template>
  <div class="error-container" :class="{ 'full-screen': fullScreen }">
    <div class="error-content">
      <div class="error-icon">
        <span class="icon">⚠️</span>
      </div>
      
      <div class="error-details">
        <h3 class="error-title">{{ title }}</h3>
        <p class="error-message">{{ message }}</p>
        
        <div v-if="details" class="error-details-text">
          <details>
            <summary>Detalles técnicos</summary>
            <pre>{{ details }}</pre>
          </details>
        </div>
      </div>
      
      <div class="error-actions">
        <button 
          v-if="showRetry" 
          @click="$emit('retry')" 
          class="retry-button"
        >
          🔄 Reintentar
        </button>
        <button 
          v-if="showReload" 
          @click="reloadPage" 
          class="reload-button"
        >
          🔄 Recargar página
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  message: string;
  details?: string;
  fullScreen?: boolean;
  showRetry?: boolean;
  showReload?: boolean;
}

interface Emits {
  retry: [];
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Error',
  fullScreen: false,
  showRetry: true,
  showReload: false,
});

const emit = defineEmits<Emits>();

const reloadPage = () => {
  window.location.reload();
};
</script>

<style scoped>
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 200px;
}

.error-container.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
}

.error-content {
  background: #1a1a1a;
  border: 1px solid #ff4444;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  text-align: center;
}

.error-icon {
  margin-bottom: 16px;
}

.error-icon .icon {
  font-size: 48px;
  display: block;
}

.error-details {
  margin-bottom: 24px;
}

.error-title {
  color: #ff4444;
  font-family: 'Space Mono', monospace;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.error-message {
  color: #ffffff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.error-details-text {
  margin-top: 16px;
}

.error-details-text details {
  text-align: left;
}

.error-details-text summary {
  color: #888888;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 8px;
}

.error-details-text pre {
  background: #000000;
  border: 1px solid #333333;
  border-radius: 4px;
  padding: 12px;
  color: #ff6666;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  overflow-x: auto;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.retry-button,
.reload-button {
  background: #ff4444;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover,
.reload-button:hover {
  background: #ff6666;
  transform: translateY(-1px);
}

.retry-button:active,
.reload-button:active {
  transform: translateY(0);
}

.reload-button {
  background: #333333;
}

.reload-button:hover {
  background: #555555;
}
</style>
