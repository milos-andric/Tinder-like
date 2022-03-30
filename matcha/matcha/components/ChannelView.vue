<template>
  <div id="chat-channels">
    <div v-if="channels.length" id="v-for-object" class="chat-list">
      <div
        v-for="channel in channels"
        :key="channel.channels"
        class="channel"
        :class="{ active: channel.name === activeroom }"
        @click="changeActiveRoom(channel)"
      >
        {{ channel.pal_name }}
      </div>
    </div>
    <div v-else>Lol</div>
  </div>
</template>

<script>
export default {
  props: {
    activeroom: {
      type: String,
      default: '',
      required: false,
    },
  },
  data() {
    return {
      channels: [],
    };
  },
  async beforeMount() {
    const resp = await this.$axios.get('getAvailableRooms');
    this.channels = resp.data;
    this.changeActiveRoom(resp.data[0]);
    this.activeroom2 = resp.data[0];
    console.log(this.activeroom2);
  },
  methods: {
    changeActiveRoom(channel) {
      if (channel) {
        this.$emit('changeActiveRoom', channel.name);
      }
    },
  },
};
</script>

<style></style>
