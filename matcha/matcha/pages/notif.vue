<template>
  <div class="container">
    <div>
      <button @click="send">send</button>
      Latest notif: {{ latestTickId }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      latestTickId: '',
    };
  },
  mounted() {
    const vm = this;
    // use "main" socket defined in nuxt.config.js
    vm.socket = this.$nuxtSocket({
      name: 'main', // select "main" socket from nuxt.config.js - we could also skip this because "main" is the default socket
    });
    vm.socket.on('tick', tickId => {
      vm.latestTickId = tickId;
    });
  },
  methods: {
    async send() {
      await this.$axios
        .get('notifMe', {})
        .then(data => {
          this.latestTickId = data;
        })
        .catch(e => {});
    },
  },
};
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}
.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}
.links {
  padding-top: 15px;
}
</style>
