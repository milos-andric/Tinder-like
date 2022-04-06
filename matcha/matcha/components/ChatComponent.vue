<template>
  <div class="d-flex flex-column">
    <div class="d-flex w-100" style="height: calc(100vh - 280px)">
      <ChannelView :activeroom="room" @changeActiveRoom="onChangeActiveRoom" />

      <div class="w-100" style="flex-grow: 1">
        <div id="v-for-object" class="w-100 chat-list pt-4">
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
      </div>
    </div>

    <div id="chat-submit" class="w-100">
      <b-input-group>
        <b-form-input
          v-model="input"
          autocomplete="off"
          type="text"
          class="input"
        />

        <template #append>
          <button class="btn btn-primary" type="submit" @click="sendMessage()">
            <font-awesome-icon color="white" icon="paper-plane" />
          </button>
        </template>
      </b-input-group>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      self_id: null,
      room: '',
      input: '',
      messages: [],
    };
  },
  async mounted() {
    const me = await this.$axios.get('/me');
    this.self_id = me.data.user_id;

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
      }
    });
  },
  methods: {
    async getMessage(room) {
      const resp = await this.$axios.post('getRoomMessages', {
        room,
      });
      this.messages = resp.data;
    },
    async sendMessage() {
      if (this.input.length > 0) {
        await this.$axios.post('sendRoomMessages', {
          room: this.room,
          message: this.input,
        });
      }

      this.input = '';
    },
    async onChangeActiveRoom(newRoom) {
      try {
        this.room = newRoom;
        await this.getMessage(newRoom);
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>

<style>
.chat-list {
  height: 100%;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  overflow-y: scroll;
}
#chat-channels {
  width: 10vw;
  min-width: 100px;
  overflow-wrap: break-word;
  overflow-y: scroll;
  background-color: paleturquoise;
}
#chat-submit {
  align-self: center;
  justify-self: flex-end;
  bottom: 0px;
  padding: 5px;
}

.message {
  border-radius: 1rem;
  padding: 1rem;
  margin: 0rem 1rem 1rem 1rem;
}

.message p {
  margin-bottom: 0;
}

.myself {
  background-color: rgba(0, 110, 255, 0.738);
  align-self: end;
}

.other {
  background-color: rgba(0, 110, 255, 0.438);
}
</style>
