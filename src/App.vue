<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap');

body {
  margin: 0;
  padding: 0;
  background-color: #050508;
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

h1, h2, h3, .fantasy-font {
  font-family: 'Cinzel', serif;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #0a0a0f;
}

::-webkit-scrollbar-thumb {
  background: #d4af37;
  border-radius: 4px;
}
</style>
