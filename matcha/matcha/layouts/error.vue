// eslint-disable-next-line vue/multi-word-component-names /* eslint-disable
vue/multi-word-component-names */
<template>
  <div class="container">
    <h1 v-if="error.statusCode === 404">Page not found</h1>
    <h1 v-else>An error occurred {{ error.statusCode }}</h1>
    <NuxtLink to="/">Home page</NuxtLink>
  </div>
</template>

<script>
export default {
  auth: 'guest',
  layout: 'empty',
  props: ['error'],
};
</script>
