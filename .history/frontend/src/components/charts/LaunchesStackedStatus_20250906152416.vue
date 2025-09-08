<template>
  <VChart :option="option" theme="spacex" autoresize style="height: 340px" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as d3 from "d3";
import { getLaunches } from "../../api";
import theme from "../../assets/theme";

const option = ref<any>({});

onMounted(async () => {
  const raw = await getLaunches();

  const key = (d: any) =>
    d.success === true
      ? "Success"
      : d.success === false
      ? "Failure"
      : "Unknown";
  const toYear = (d: any) => new Date(d.date_utc).getUTCFullYear();

  const byYear = d3
    .rollups(
      raw.filter((d: any) => d.date_utc),
      (v: any[]) => d3.rollup(v, (vv: any[]) => vv.length, key),
      toYear as any
    )
    .map(([year, counts]: any) => ({
      year: String(year),
      success: counts.get("Success") ?? 0,
      failure: counts.get("Failure") ?? 0,
      unknown: counts.get("Unknown") ?? 0,
    }))
    .sort((a: any, b: any) => +a.year - +b.year);

  const years = byYear.map((d) => d.year);
  const success = byYear.map((d) => d.success);
  const failure = byYear.map((d) => d.failure);
  const unknown = byYear.map((d) => d.unknown);
  const totals = byYear.map((d) => d.success + d.failure + d.unknown);

  const successColor = {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: theme.color[5] },
      { offset: 1, color: "#2e7d32" },
    ],
  };
  const failureColor = {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: theme.color[0] },
      { offset: 1, color: "#c62828" },
    ],
  };
  const unknownColor = {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: theme.color[6] },
      { offset: 1, color: "#78909c" },
    ],
  };

  option.value = {
    grid: { top: 40, left: 48, right: 24, bottom: 48 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any[]) => {
        const p = Object.fromEntries(
          params.map((p) => [p.seriesName, p.value])
        );
        const year = params[0]?.axisValueLabel ?? "";
        const total = (p.Success ?? 0) + (p.Failure ?? 0) + (p.Unknown ?? 0);
        return `
          <div><b>${year}</b></div>
          <div>Success: ${p.Success ?? 0}</div>
          <div>Failure: ${p.Failure ?? 0}</div>
          <div>Unknown: ${p.Unknown ?? 0}</div>
          <hr style="border-color:#263238"/>
          <div>Total: <b>${total}</b></div>
        `;
      },
    },
    legend: { data: ["Success", "Failure", "Unknown"] },
    xAxis: { type: "category", data: years },
    yAxis: { type: "value", name: "Launches" },

    // Zoom para recorrer muchos años
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      {
        type: "slider",
        height: 16,
        bottom: 12,
        handleSize: 12,
        ...theme.dataZoom,
      },
    ],

    // Animaciones suaves
    animationDuration: 600,
    animationEasing: "cubicOut",

    series: [
      {
        name: "Success",
        type: "bar",
        stack: "total",
        data: success,
        itemStyle: { color: successColor, borderRadius: [6, 6, 0, 0] },
        emphasis: { focus: "series" },
      },
      {
        name: "Failure",
        type: "bar",
        stack: "total",
        data: failure,
        itemStyle: { color: failureColor, borderRadius: [6, 6, 0, 0] },
        emphasis: { focus: "series" },
      },
      {
        name: "Unknown",
        type: "bar",
        stack: "total",
        data: unknown,
        itemStyle: { color: unknownColor, borderRadius: [6, 6, 0, 0] },
        emphasis: { focus: "series" },
      },
      // Etiqueta de TOTAL por barra (serie auxiliar)
      {
        name: "Total",
        type: "bar",
        stack: "total",
        data: totals,
        barGap: "-100%",
        itemStyle: { color: "transparent" },
        label: {
          show: true,
          position: "top",
          formatter: (p: any) => totals[p.dataIndex],
          color: "#eceff1",
          fontWeight: 600,
        },
        emphasis: { disabled: true },
        tooltip: { show: false },
      },
    ],
  };
});
</script>
