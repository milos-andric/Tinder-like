<template>
  <div>
    <p>Hello you have been successfully logged in</p>
    <button @click="getUserInfo">getUserInfo</button>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  mounted() {
    this.socket = this.$nuxtSocket({
      name: 'main',
      //     // channel: '/', // NAMESPACE
      // auth: {
      // token: localStorage.getItem('auth._token.local'),
      // },
    });
  },
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
