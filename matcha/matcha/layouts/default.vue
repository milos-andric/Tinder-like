<template>
  <div class="d-flex flex-column min-vh-100">
    <LayoutHeader />

    <div class="py-5">
        <Nuxt />
    </div>

    <LayoutFooter />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
}
</script>