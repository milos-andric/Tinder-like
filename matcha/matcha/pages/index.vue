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
    this.getIp();
  },
  methods: {
    getIp(url) {
      return this.$axios('/getIP').then(res => {
        console.log(res.data.ip);
      });
    },
    async getUserInfo() {
      try {
        const data = await this.$axios.get('user');
        console.log(data);
      } catch (e) {
        this.errorMsg = e.response.data.msg;
        this.alertStatus = true;
        this.successStatus = false;
      }
    },
  },
};
</script>
