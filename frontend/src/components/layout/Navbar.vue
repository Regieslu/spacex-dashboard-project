<template>
  <header class="navbar">
    <div class="navbar-content">
      <!-- Logo/Brand -->
      <div class="brand">
        <h1 class="brand-title">SpaceX</h1>
      </div>

      <nav class="nav-links">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: $route.path.startsWith(item.to) }"
        >
          <component :is="item.icon" :size="20" color="#ffffff" />
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="user-section"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Home,
  Rocket,
  Satellite,
  User,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-vue-next";

const showUserMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/launches-rockets", label: "Launches & Rockets", icon: Rocket },
  { to: "/starlink", label: "Starlink", icon: Satellite },
];

// Close menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-menu")) {
    showUserMenu.value = false;
  }
};

// Add event listener when component mounts
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.navbar {
  background: #000000;
  border-bottom: 1px solid #1f2430;
  padding: 0 24px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 30;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1700px;
  margin: 0 auto;
}

.brand {
  display: flex;
  align-items: center;
}

.brand-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  font-family: "Space Grotesk", "Inter", system-ui, sans-serif;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.nav-link:hover {
  background: #1d2230;
  color: #ffffff;
}

.nav-link.active {
  background: linear-gradient(90deg, #ff83c433, transparent);
  color: #ffffff;
  border: 1px solid #ff83c41a;
}

.nav-text {
  white-space: nowrap;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.user-name {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.user-role {
  color: #94a3b8;
  font-size: 12px;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #1d2230;
  border-radius: 50%;
  border: 2px solid #2a3142;
}

.user-menu {
  position: relative;
}

.menu-trigger {
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.menu-trigger:hover {
  background: #1d2230;
  color: #ffffff;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #000000;
  border: 1px solid #1f2430;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
  padding: 8px 0;
  min-width: 180px;
  z-index: 50;
  margin-top: 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #1d2230;
  color: #ffffff;
}

.dropdown-item.logout {
  color: #f87171;
}

.dropdown-item.logout:hover {
  background: #1d2230;
  color: #fca5a5;
}

.dropdown-divider {
  border: none;
  border-top: 1px solid #1f2430;
  margin: 8px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
  }

  .nav-links {
    display: none;
  }

  .user-info {
    display: none;
  }

  .brand-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 12px;
  }

  .brand-title {
    font-size: 16px;
  }
}
</style>
