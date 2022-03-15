<template>
  <div>
    <p>Hello 2</p>
    <nuxt-link to="/match">Home</nuxt-link>
  </div>
</template>

<script>
export default {
  middleware: 'auth',
};
</script>

<style></style>
