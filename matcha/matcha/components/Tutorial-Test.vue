<template>
  <button @click="showMessageFromBackend">Show message from backend</button>
</template>

<script>
export default {
  methods: {
    async showMessageFromBackend () {

      try {
        // eslint-disable-next-line no-unused-vars
        const response = await this.$axios.get('/api/test')
        console.log(response.data)
      } catch (err) {
        console.log(err)
      }

    }
  }
}
</script>
