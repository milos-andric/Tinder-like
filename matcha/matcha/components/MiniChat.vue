<template>
  <div class="d-flex">

    <!-- Chat box -->
    <div
      v-if="chatToggled"
      class="position-absolute w-50 mr-4 border bg-white"
      style="bottom: 192px; right: 20%; z-index: 99"
    >
      <b-button
        class="d-flex justify-content-between align-items-center px-3"
        variant="light"
        style="
          height: 50px;
          width: 100%;
          border-bottom-right-radius: 0;
          border-bottom-left-radius: 0;
        "
      >
        <b-link
          class="d-flex align-items-center text-dark"
          :to="'/user/' + curChannel.pal_id"
        >
          <div class="position-relative">
            <b-avatar
              :src="curChannel.pal_img ? curChannel.pal_img.url : ''"
              class="mr-3"
            ></b-avatar>
            <div
              v-if="onlineUsers.find(e => e === curChannel.pal_id)"
              class="mb-1 text-success bg-success position-absolute"
              style="
                width: 15px;
                height: 15px;
                border-radius: 50px;
                bottom: -5px;
                right: 12px;
                border: 3px solid #f8f9fa;
              "
            ></div>
          </div>
          <div v-if="curChannel" class="font-weight-bold">
            {{ curChannel.pal_name }}
          </div>
        </b-link>
        <b-button variant="text" @click="chatToggled = false">
          <font-awesome-icon color="auto" icon="xmark" />
        </b-button>
      </b-button>
      <div
        id="message-box"
        class="pt-4 d-flex flex-column"
        style="max-height: 50vh; overflow-y: auto"
      >
        <div
          v-for="item in messages"
          :key="item.messages"
          :class="item.sender_id === self_id ? 'myself' : 'other'"
          class="message"
        >
          <p class="font-weight-bold mb-2">{{ item.user_name }}</p>
          <p>{{ item.message }}</p>
        </div>
      </div>

      <div class="w-100">
        <b-input-group>
          <b-form-input
            v-model="input"
            autocomplete="off"
            type="text"
            class="input"
            style="border-radius: 0"
            @keyup.enter="sendMessage()"
          />

          <template #append>
            <button
              class="btn btn-secondary"
              type="submit"
              style="border-radius: 0"
              @click="sendMessage()"
            >
              <font-awesome-icon color="white" icon="paper-plane" />
            </button>
          </template>
        </b-input-group>
      </div>
    </div>

    <!-- Room selector -->
    <div
      class="position-absolute"
      style="bottom: 191px; right: 0; width: 20%; z-index: 99; background: white"
    >
      <b-button
        v-b-toggle.chatBox
        class="d-flex justify-content-between align-items-center px-3"
        variant="outline-secondary"
        style="
          height: 40px;
          width: 100%;
          border-bottom-right-radius: 0;
          border-bottom-left-radius: 0;
        "
      >
        <div>Chat</div>
        <font-awesome-icon v-if="!chatBoxState" color="auto" icon="angle-up" />
        <font-awesome-icon v-else color="auto" icon="xmark" />
      </b-button>
      <b-collapse id="chatBox" v-model="chatBoxState">
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
              <p class="mb-1 font-weight-bold">{{ channel.pal_name }}</p>
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
        <div v-else id="no-chat">You have no available chat</div>
      </b-collapse>
    </div>
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
      chatBoxState: false,

      self_id: null,
      room: '',
      curChannel: '',
      input: '',
      messages: [],

      chatToggled: false,
    };
  },
  async mounted() {
    this.socket = this.$store.socket;
    this.socket.on('online', data => (this.onlineUsers = data));

    this.self_id = (await this.$axios.get('/me')).data.user_id;

    this.socket = this.$nuxtSocket({
      name: 'chat',
      channel: '/',
      auth: {
        token: localStorage.getItem('auth._token.local'),
      },
      reconnection: false,
    });

    this.socket.on('receiveChatMessage', data => {
      if (data.chat_id === this.room) {
        this.messages.push(data);
        this.scrollToLast();
      }
    });
  },
  async beforeMount() {
    try {
      const resp = await this.$axios.get('getAvailableRooms');
      this.channels = resp.data;
      if (resp.data[0]) {
        this.room = resp.data[0].name;
        this.curChannel = resp.data[0];
        await this.getMessage(resp.data[0].name);
      }
    } catch (e) {}
  },
  methods: {
    async changeActiveRoom(channel) {
      if (channel) {
        this.room = channel.name;
        this.curChannel = channel;
        await this.getMessage(channel.name);
        this.chatToggled = true;
      }
    },
    async getMessage(room) {
      const resp = await this.$axios.post('getRoomMessages', {
        room,
      });
      this.messages = resp.data;
      this.scrollToLast();
    },
    async sendMessage() {
      this.input = this.input.trim();
      if (this.input.length > 0) {
        await this.$axios.post('sendRoomMessages', {
          room: this.room,
          message: this.input,
        });
      }

      this.input = '';
    },
    scrollToLast() {
      setTimeout(() => {
        const box = document.getElementById('message-box');
        if (box) {
          const target = box.lastElementChild;
          if (target) target.scrollIntoView();
        }
      }, 10);
    },
  },
};
</script>

<style scoped>
.channel:hover {
  background-color: #00000014;
}
#no-chat {
  background-color: rgb(206, 105, 105);
}
</style>
