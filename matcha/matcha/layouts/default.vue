<template>
  <div class="d-flex flex-column min-vh-100 overflow-hidden">
    <LayoutHeader />

    <div class="py-5" style="flex: auto">
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
