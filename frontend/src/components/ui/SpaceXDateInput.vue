<!-- components/ui/SpaceXDateInput.vue -->
<template>
  <div class="date-group">
    <label v-if="label" class="date-label">{{ label }}</label>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="date"
      class="spacex-date-input"
      :class="{ 'has-value': modelValue }"
      :min="min"
      :max="max"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  label?: string;
  min?: string;
  max?: string;
}

defineProps<Props>();
defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<style scoped>
.date-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.spacex-date-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid #ffffff;
  border-radius: 0;
  color: #ffffff;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 500;
  min-width: 140px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.spacex-date-input:focus {
  outline: none;
  border-bottom-color: #ff58b0;
}

.spacex-date-input:hover {
  border-bottom-color: #ff58b0;
}

.spacex-date-input.has-value {
  color: #ff58b0;
  border-bottom-color: #ff58b0;
}

/* Estilos para el calendario nativo */
.spacex-date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.spacex-date-input::-webkit-datetime-edit-text {
  color: #ffffff;
}

.spacex-date-input::-webkit-datetime-edit-month-field,
.spacex-date-input::-webkit-datetime-edit-day-field,
.spacex-date-input::-webkit-datetime-edit-year-field {
  color: #ffffff;
}

/* Responsive */
@media (max-width: 768px) {
  .spacex-date-input {
    min-width: 100%;
  }
}
</style>
