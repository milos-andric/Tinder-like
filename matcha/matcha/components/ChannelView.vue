<template>
  <div id="chat-channels">
    <div v-if="channels.length" id="v-for-object" class="chan-list">
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

<style>
.chan-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.channel {
  font-style: oblique;
  padding: 2%;
  margin: 5%;
  border: 1px solid rgba(0, 0, 0, 0.281);
}

.active {
  background-color: rgba(0, 0, 0, 0.856);
  color: rgba(250, 235, 215, 0.733);
  font-style: normal;
}

.channel:hover {
  cursor: pointer;
}
</style>
