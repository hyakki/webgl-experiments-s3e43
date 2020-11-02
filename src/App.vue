<template>
  <div class="app">
    <WebglComponent class="app__webgl" />
    <div class="app__title">
      Infinite Slider
    </div>
  </div>
</template>

<script lang="ts">
import WebglComponent from '@/components/WebglComponent.vue'

export default {
  name: 'App',
  components: {
    WebglComponent,
  },
}
</script>

<style lang="scss">
[class*='app--'],
body {
  overscroll-behavior: none;
}

.app {
  @include get-all-space;

  color: $c-black;
  background-color: $c-background;
  overflow: hidden;
}

.app__webgl {
  @include get-all-space;

  overflow: hidden;
}

.app__title {
  @include center-xy;
  @extend %fw-ultra;
  @extend %text-uppercase;

  color: $c-white;
  font-size: 7vw;
  line-height: 1em;
  letter-spacing: 0.3em;
  white-space: nowrap;
  mix-blend-mode: overlay;
  user-select: none;
  pointer-events: none;
}
</style>
