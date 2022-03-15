<template>
  <div>
    <p>Hello</p>
    <nuxt-link to="/match/profile-view">Page 2</nuxt-link>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  middleware: 'auth',
};
</script>
