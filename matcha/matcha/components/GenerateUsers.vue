<template>
  <div id="generate-wrapper">
    <button @click="build(200)">Generate 200 Users.</button>
  </div>
</template>

<script>
export default {
  methods: {
    async build(number) {
      await this.$axios.post('registerMany', number);
    },
  },
};
</script>

<style>
#generate-wrapper {
  display: flex;
  justify-content: center;
  align-content: center;
}
</style>
