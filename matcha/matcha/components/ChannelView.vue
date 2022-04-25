<template>
  <div>
    <div
      v-b-toggle.sidebar-1
      class="h-100 p-3 d-flex align-items-center"
      style="background-color: #e2e2e2"
    >
      <font-awesome-icon color="grey" icon="angle-right" />
    </div>
    <b-sidebar id="sidebar-1" title="Discussions" backdrop shadow width="250px">
      <div v-if="channels.length" class="chan-list">
        <div
          v-for="channel in channels"
          :key="channel.channels"
          class="channel d-flex align-items-center"
          :class="{ active: channel.name === activeroom }"
          @click="changeActiveRoom(channel)"
        >
          <b-avatar
            :src="channel.pal_img ? channel.pal_img.url : ''"
            class="mr-3"
          ></b-avatar>
          <div>
            <p id="pseudo-overflow" class="mb-1 font-weight-bold">
              {{ channel.pal_name }}
            </p>
            <p
              v-if="onlineUsers.find(e => e === channel.pal_id)"
              class="mb-1 text-success"
            >
              Online
            </p>
            <p v-else class="mb-1 text-secondary">Offline</p>
          </div>
        </div>
      </div>
      <div v-else>You have no accessible chat channel</div>
    </b-sidebar>
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
      onlineUsers: [],
    };
  },
  mounted() {
    this.socket = this.$store.socket;
    this.socket.on('online', data => (this.onlineUsers = data));
  },
  async beforeMount() {
    try {
      const resp = await this.$axios.get('getAvailableRooms');
      this.channels = resp.data;
      if (this.$route.params.chatName) {
        this.changeActiveRoomByName(this.$route.params.chatName);
      } else {
        this.changeActiveRoom(resp.data[0]);
      }
    } catch (e) {
      this.$nuxt.context.error({
        status: 404,
      });
    }
  },
  methods: {
    changeActiveRoomByName(channelName) {
      const c = this.channels.filter(e => e.name === channelName);
      if (c.length === 1) {
        this.changeActiveRoom(c[0]);
      } else {
        this.changeActiveRoom(this.channels[0]);
      }
    },
    changeActiveRoom(channel) {
      if (channel) {
        this.$emit('changeActiveRoom', channel.name, channel.pal_name);
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
  padding: 1rem;
  width: 100%;
  border: 1px solid #dee2e6;
}
.active {
  background-color: rgba(0, 0, 0, 0.856);
  color: rgba(250, 235, 215, 0.733);
}
.channel:hover {
  cursor: pointer;
}
#pseudo-overflow {
  overflow-wrap: break-word;
  width: 170px;
}
</style>
