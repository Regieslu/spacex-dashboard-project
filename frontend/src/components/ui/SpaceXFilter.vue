<!-- components/ui/SpaceXFilter.vue -->
<template>
  <div class="filter-group">
    <label v-if="label" class="filter-label">{{ label }}</label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="spacex-filter"
      :class="{ 'has-value': modelValue && modelValue !== 'all' }"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  modelValue: string;
  options: FilterOption[];
  label?: string;
}

defineProps<Props>();
defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<style scoped>
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.spacex-filter {
  background: transparent;
  border: none;
  border-bottom: 1px solid #ffffff;
  border-radius: 0;
  color: #ffffff;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 500;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0 center;
  background-size: 16px;
  padding-right: 24px;
}

.spacex-filter:focus {
  outline: none;
  border-bottom-color: #ff58b0;
}

.spacex-filter:hover {
  border-bottom-color: #ff58b0;
}

.spacex-filter.has-value {
  color: #ff58b0;
  border-bottom-color: #ff58b0;
}

.spacex-filter option {
  background: #000000;
  color: #ffffff;
  padding: 8px 12px;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .spacex-filter {
    min-width: 100%;
  }
}
</style>
