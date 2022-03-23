<template>
  <div class="container">
    <button @click="send">emit</button>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'NotifPage',
  data() {
    return {
      message: 'old',
    };
  },
  mounted() {
    this.socket = this.$nuxtSocket({
      name: 'main',
      // channel: '/notification', // NAMESPACE
      auth: {
        token: localStorage.getItem('auth._token.local'),
      },
    });
    this.socket.on('receiveNotification', content => {
      this.message = content;
    });
  },
  methods: {
    send() {
      this.socket.emit('sendNotification', { receiverId: 1 });
    },
  },
};
</script>

{ name: "John" }
