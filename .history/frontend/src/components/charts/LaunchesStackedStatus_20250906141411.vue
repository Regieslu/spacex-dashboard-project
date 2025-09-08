<template>
  <VChart :option="option" autoresize style="height: 340px" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as d3 from "d3";
import { getLaunches } from "../../api";

const option = ref<any>({});

onMounted(async () => {
  const raw = await getLaunches();
  const key = (d: any) =>
    d.success === true
      ? "Success"
      : d.success === false
      ? "Failure"
      : "Unknown";
  const toYear = (d: any) => new Date(d.date_utc).getFullYear();
  const byYear = d3
    .rollups(
      raw.filter((d) => d.date_utc),
      (v) => d3.rollup(v, (vv) => vv.length, key),
      toYear as any
    )
    .map(([year, counts]) => ({
      year: String(year),
      success: counts.get("Success") ?? 0,
      failure: counts.get("Failure") ?? 0,
      unknown: counts.get("Unknown") ?? 0,
    }))
    .sort((a, b) => +a.year - +b.year);

  option.value = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["Success", "Failure", "Unknown"],
    },
    grid: {
      top: 36,
      left: 40,
      right: 20,
      bottom: 30,
    },
    xAxis: {
      type: "category",
      data: byYear.map((d) => d.year),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Success",
        type: "bar",
        stack: "total",
        emphasis: {
          focus: "series",
        },
        data: byYear.map((d) => d.success),
        itemStyle: {
          color: "#2ecc71",
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: "Failure",
        type: "bar",
        stack: "total",
        emphasis: {
          focus: "series",
        },
        data: byYear.map((d) => d.failure),
        itemStyle: {
          color: "#e74c3c",
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: "Unknown",
        type: "bar",
        stack: "total",
        emphasis: {
          focus: "series",
        },
        data: byYear.map((d) => d.unknown),
        itemStyle: {
          color: "#95a5a6",
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  };
});
</script>
