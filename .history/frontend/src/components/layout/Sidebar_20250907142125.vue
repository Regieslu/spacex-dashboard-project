<template>
  <aside
    :class="['sidebar', { open: isOpen, collapsed: isCollapsed }]"
    @keydown.esc="isOpen = false"
    aria-label="Primary"
  >
    <div class="brand">
      <span class="logo">🚀</span>
      <span class="name" v-show="!isCollapsed">SpaceX Viz</span>
    </div>

    <nav class="nav">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="link"
        :class="{ active: $route.path.startsWith(item.to) }"
        :aria-current="$route.path.startsWith(item.to) ? 'page' : undefined"
        @click="isOpen = false"
        :title="isCollapsed ? item.label : undefined"
      >
        <span class="icon" aria-hidden="true">{{ item.emoji }}</span>
        <span class="text" v-show="!isCollapsed">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="footer" v-show="!isCollapsed">v1.0</div>

    <!-- Botón para contraer/expandir (solo desktop) -->
    <button 
      class="collapse-btn" 
      @click="toggleCollapse" 
      aria-label="Toggle sidebar"
      v-show="!isCollapsed"
    >
      ←
    </button>
    
    <button 
      class="expand-btn" 
      @click="toggleCollapse" 
      aria-label="Expand sidebar"
      v-show="isCollapsed"
    >
      →
    </button>

    <!-- botón flotante solo en mobile -->
    <button class="toggle" @click="isOpen = !isOpen" aria-label="Toggle menu">
      ☰
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isOpen = ref(false);
const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const items = [
  { to: "/dashboard", label: "Dashboard", emoji: "🏠" },
  { to: "/launches-rockets", label: "Launches & Rockets", emoji: "📊" },
  { to: "/starlink", label: "Starlink", emoji: "🛰️" },
];
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  height: 100dvh;
  width: 260px;
  background: #161a20;
  color: #e5e7eb;
  border-right: 1px solid #1f2430;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 60px;
  padding: 14px 8px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  justify-content: center;
}

.sidebar.collapsed .brand {
  justify-content: center;
}

.logo {
  font-size: 20px;
}
.name {
  font-weight: 700;
  letter-spacing: 0.2px;
}
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}
.link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #cbd5e1;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.link:hover {
  background: #1d2230;
  color: #fff;
}
.link.active {
  background: linear-gradient(90deg, #ff83c433, transparent);
  outline: 1px solid #ff83c41a;
  color: #fff;
}
.icon {
  width: 22px;
  text-align: center;
}
.footer {
  margin-top: auto;
  opacity: 0.6;
  font-size: 12px;
  padding: 6px 8px;
}

/* Mobile: sidebar overlay + botón flotante */
@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    transform: translateX(-100%);
    z-index: 40;
    width: 88%;
    max-width: 300px;
    border-right: none;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
  }
  .sidebar.open {
    transform: translateX(0);
    transition: transform 0.2s ease;
  }
  .toggle {
    position: fixed;
    left: 12px;
    bottom: 14px;
    z-index: 50;
    background: #1d2230;
    color: #fff;
    border: 1px solid #2a3142;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  }
}
/* Desktop: sin botón */
@media (min-width: 901px) {
  .toggle {
    display: none;
  }
}
</style>
