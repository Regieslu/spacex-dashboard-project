<template>
  <div ref="root" style="width: 100%; height: 340px; position: relative">
    <div
      v-if="error"
      style="position: absolute; inset 0; display: flex; align-items: center; color: #b00020;"
    >
      {{ error }}
    </div>
    <div
      v-else-if="loading"
      style="position: absolute; inset 0; display: flex; align-items: center; justify-content: center;"
    >
      Loading...
    </div>
    <div v-show="hover" :style="tooltipStyle">{{ hover }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive, watch } from "vue";
import * as d3 from "d3";
import { getLaunches } from "../../api";

type Launch = {
  date_utc?: string;
  success?: boolean | null;
}

const root = ref<HTMLDivElement | null>(null);
const error = ref<string | null>(null);
const loading = ref<boolean>(false);
const hover = ref<string | null>(null);
const hoverState = reactive({data: [] as Launch[]});

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  loading.value = true;
  try {
    hoverState.data = await getLaunches();
    draw();
    // re-draw whenever host dimension changes
    resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(root.value!);
  } catch(err: any) {
    error.value = err?message ?? "Error loading launches";
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => resizeObserver?.disconnect());

watch(() => state.data, draw);

function draw() {
  const host = root.value!;
  if (!host) return;
  host.innerHTML = "";
  const width = host.clientWidth;
  const height = host.clientHeight;
  const margin = { top: 24, right: 16, bottom: 28, left: 44 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data transformation: count by year/state
  const parseYear = (d: Launch) => (d.date_utc ? new Date(d.date_utc).getFullYear() : null);
  const statusKey = (d: Launch) => d.success ? "success" : !d.success ? "failure" : "unknown";

  const byYear = d3.rollups(state.data.filter(d => parseYear(d) !== null),
    v => {
      const counts = d3.rollups(v, v => v.length, d => statusKey(d));
      return {
        success: counts.get("success") ?? 0,
        failure: counts.get("failure") ?? 0,
        unknown: counts.get("unknown") ?? 0,
      }
    },
    parseYear as any
  )
  .map(([year, counts] => ({year: year as number, ...counts})))
  .sort((a, b) => a.year - b.year);

  if (!byYear.length) return;

  // keys for stacking
  const keys = ["success", "failure", "unknown"] as const;

  // axis scales
  const axisX = d3.scaleBand()
    .domain(byYear.map(d => String(d.year)))
    .range([0, innerWidth])
    .padding(0.16);

  const axisY = d3.scaleLinear()
    .domain([0, d3.max(byYear, d => d.success + d.failure + d.unknown) || 1])
    .nice()
    .range([innerHeight, 0]);

  const color = d3.scaleOrdinal<string, string>()
    .domain(keys as unknown as string[])
    .range("#2e7d32", "#c62828", "#757575");

  // bar layout
  const stack = d3.select(host)
  .append
}
</script>
