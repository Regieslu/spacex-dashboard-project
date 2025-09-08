// base color palette
const colors = [
  "#ff58b0", // magenta primario
  "#ff83c4", // rosa
  "#7c4dff", // violeta
  "#00e5ff", // cian
  "#ffb74d", // ámbar
  "#81c784", // verde
  "#b0bec5", // gris-azulado
];

const axisText = "#cfd8dc";
const axisLine = "#90a4ae55";
const splitLine = "#546e7a55";
const titleText = "#eceff1";
const bg = "#111317";
const panel = "#161a20";
const tooltipBg = "rgba(13,16,22,.96)";

// Colores de fondo reutilizables
const backgrounds = {
  main: "#000000", // Fondo principal negro (como la tabla)
  card: "#000000", // Fondo de cards
  container: "#000000", // Fondo de contenedores
  sidebar: "#161a20", // Fondo del sidebar
  shell: "#0f1116", // Fondo del shell principal
};

// Tipografía SpaceX-style
const typography = {
  // Fuente principal (similar a SpaceX)
  primary: "'Space Grotesk', 'Montserrat', 'Inter', system-ui, sans-serif",
  // Fuente monoespaciada para elementos técnicos (como la tabla)
  mono: "'Space Mono', 'Courier New', 'Monaco', 'Menlo', monospace",
  // Fuente secundaria
  secondary: "'Inter', system-ui, sans-serif",
};

const theme: Record<string, any> = {
  color: colors,
  backgroundColor: "transparent",
  textStyle: {
    color: axisText,
    fontFamily: "Inter, system-ui, Roboto, Segoe UI, Arial, sans-serif",
  },

  title: {
    textStyle: { color: titleText, fontWeight: 700, fontSize: 18 },
    subtextStyle: { color: "#b0bec5" },
  },

  grid: {
    left: 40,
    right: 24,
    top: 40,
    bottom: 36,
    containLabel: true,
    backgroundColor: panel,
    show: false,
  },

  legend: {
    textStyle: { color: axisText, fontSize: 12 },
    itemWidth: 14,
    itemHeight: 10,
    itemGap: 16,
    icon: "roundRect",
  },

  tooltip: {
    backgroundColor: tooltipBg,
    borderColor: "#263238",
    borderWidth: 1,
    textStyle: { color: "#eceff1", fontSize: 12 },
    axisPointer: {
      type: "line",
      lineStyle: { color: "#ffffff30", width: 1 },
      crossStyle: { color: "#ffffff30" },
    },
    extraCssText:
      "backdrop-filter: blur(6px); border-radius:8px; padding:8px 10px;",
  },

  // category axis (applies to x and y)
  categoryAxis: {
    axisLine: { lineStyle: { color: axisLine } },
    axisTick: { show: false },
    axisLabel: { color: axisText, margin: 8 },
    splitLine: { show: false },
    nameTextStyle: { color: axisText },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: axisText, margin: 6 },
    splitLine: { show: true, lineStyle: { color: splitLine } },
    nameTextStyle: { color: axisText },
  },

  // series by type (defaults pretty)
  line: {
    symbol: "circle",
    symbolSize: 6,
    smooth: true,
    lineStyle: { width: 3 },
    areaStyle: { opacity: 0.08 },
    itemStyle: { borderWidth: 0 },
  },

  bar: {
    barMaxWidth: 42,
    itemStyle: {
      borderRadius: [8, 8, 0, 0],
      shadowBlur: 10,
      shadowColor: "rgba(0,0,0,.25)",
      shadowOffsetY: 2,
    },
  },

  pie: {
    itemStyle: { borderColor: bg, borderWidth: 2 },
    label: { color: axisText, fontWeight: 500 },
  },

  radar: {
    axisName: { color: axisText },
    splitArea: { areaStyle: { color: ["#161a20", "#14181e"] } },
    splitLine: { lineStyle: { color: "#263238" } },
    indicator: [],
  },

  toolbox: { iconStyle: { borderColor: axisText } },
  dataZoom: {
    textStyle: { color: axisText },
    handleStyle: { color: "#ffffff80" },
    dataBackground: {
      lineStyle: { color: "#ffffff30" },
      areaStyle: { color: "#ffffff10" },
    },
  },

  visualMap: {
    textStyle: { color: axisText },
    inRange: { color: ["#ff83c4", "#ff58b0"] },
  },
};

// Exportar colores individuales para uso en componentes
export { backgrounds, colors, axisText, titleText, panel, tooltipBg };

export default theme;
