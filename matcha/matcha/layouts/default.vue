<template>
  <div class="d-flex flex-column min-vh-100 overflow-hidden">
    <LayoutHeader />

    <div
      :class="$nuxt.$route.path.startsWith('/chat') ? '' : 'py-5'"
      style="flex: auto"
    >
      <Nuxt />
    </div>

    <LayoutFooter />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
};
</script>
