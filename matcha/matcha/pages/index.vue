<template>
  <div>
    <p>Hello you have been successfully logged in</p>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  methods: {
    async getUserInfo() {
      try {
        await this.$axios.get('user');
      } catch (e) {
        this.errorMsg = e.response.data.msg;
        this.alertStatus = true;
        this.successStatus = false;
      }
    },
  },
};
</script>
