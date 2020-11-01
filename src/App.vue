<template>
  <div class="app">
    <WebglComponent class="app__webgl" />
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
  color: $c-black;
}

.app__webgl {
  @include get-all-space;

  overflow: hidden;
}
</style>
