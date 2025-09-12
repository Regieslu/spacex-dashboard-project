<template>
  <header class="navbar">
    <div class="navbar-content">
      <!-- Logo/Brand -->
      <div class="brand">
        <router-link to="/dashboard" class="brand-link">
          <img src="/spacex-logo3.jpg" alt="SpaceX" class="brand-logo" />
        </router-link>
      </div>

      <!-- Desktop Navigation -->
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

      <!-- Mobile Menu Button -->
      <button
        class="mobile-menu-button"
        :class="{ 'menu-open': isMobileMenuOpen }"
        @click="toggleMobileMenu"
      >
        <component
          :is="isMobileMenuOpen ? 'X' : 'Menu'"
          :size="24"
          color="#ffffff"
        />
      </button>

      <!-- Mobile Navigation -->
      <nav
        class="nav-links-mobile"
        :class="{ 'mobile-menu-open': isMobileMenuOpen }"
      >
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link-mobile"
          :class="{ active: $route.path.startsWith(item.to) }"
          @click="closeMobileMenu"
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
  Menu,
  X,
} from "lucide-vue-next";

const showUserMenu = ref(false);
const isMobileMenuOpen = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
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

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.brand-link:hover {
  opacity: 0.8;
}

.brand-logo {
  height: 24px;
  width: 105px;
  height: 57px;
  background-color: #000000;
  padding: 2px 1px;
  border-radius: 1px;
}

.brand-text {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  font-family: "Space Grotesk", "Inter", system-ui, sans-serif;
}

/* Legacy class for compatibility */
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

/* Mobile Menu Button */
.mobile-menu-button {
  display: none;
  background: #1f2430;
  border: 1px solid #374151;
  color: #ffffff;
  cursor: pointer;
  padding: 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-menu-button:hover {
  background-color: #374151;
  border-color: #4b5563;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.mobile-menu-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-menu-button.menu-open {
  background-color: #1e40af;
  border-color: #2563eb;
  color: #ffffff;
}

/* Mobile Navigation */
.nav-links-mobile {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #000000;
  border-top: 1px solid #1f2430;
  flex-direction: column;
  padding: 16px;
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 40;
}

.nav-links-mobile.mobile-menu-open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.nav-link-mobile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.nav-link-mobile:hover {
  background-color: #1f2430;
  color: #ffffff;
}

.nav-link-mobile.active {
  background-color: #1e40af;
  color: #ffffff;
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
  }

  .nav-links {
    display: none;
  }

  .mobile-menu-button {
    display: block;
  }

  .nav-links-mobile {
    display: flex;
  }

  .user-info {
    display: none;
  }

  .brand-logo {
    width: 100px;
    height: 60px;
  }

  .brand-text {
    font-size: 18px;
  }

  .brand-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 12px;
  }

  .brand-logo {
    width: 80px;
    height: 50px;
  }

  .brand-text {
    font-size: 16px;
  }

  .brand-title {
    font-size: 16px;
  }

  .nav-links-mobile {
    padding: 12px;
  }

  .nav-link-mobile {
    padding: 10px 12px;
    font-size: 14px;
  }
}
</style>
