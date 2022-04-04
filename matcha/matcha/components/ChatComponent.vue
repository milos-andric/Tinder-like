<template>
  <div>
    <div id="chat-wrapper">
      <ChannelView :activeroom="room" @changeActiveRoom="onChangeActiveRoom" />
      <div id="chat-box">
        <div id="message-box">
          <div id="v-for-object" class="chat-list">
            <div
              v-for="item in messages"
              :key="item.messages"
              :class="{}"
              class="chat-message me"
            >
              <!-- // v-if en fonction de si on est le sender ou non -->
              {{ item.sender_id + ' - ' + item.message }}
            </div>
          </div>
          <div id="chat-submit">
            <input v-model="input" type="text" />
            <button type="submit" @click="sendMessage()">submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      room: '',
      input: '',
      messages: [],
    };
  },
  async beforeMount() {
    await this.getMessage(this.room);
  },
  mounted() {
    this.socket = this.$nuxtSocket({
      name: 'chat',
      channel: '/',
      auth: {
        token: localStorage.getItem('auth._token.local'),
      },
      reconnection: false,
    });
    this.socket.on('receiveChatMessage', data => {
      console.log(data.chat_id, this.room);
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
      // this.messages.push(resp.data);
      this.input = '';
    },
    async onChangeActiveRoom(newRoom) {
      try {
        await this.getMessage(newRoom);
        this.room = newRoom;
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>

<style>
#chat-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  height: 70vh;
}
.chat-list {
  height: 95%;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  overflow-y: scroll;
}
#chat-box {
  height: 100%;
}
#message-box {
  width: 75vw;
  height: 100%;
  overflow-wrap: break-word;
  background-color: pink;
  display: flex;
  display: flex;
  flex-direction: column;
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
}

.me {
  background-color: rgba(0, 110, 255, 0.438);
  border-radius: 10px;
}
.chat-message {
  font-family: 'Helvetica', 'Lucida Sans Unicode', 'Lucida Grande',
    'Lucida Sans', Arial, sans-serif;
  margin-top: 2vh;
  padding: 1% 2% 1% 2%;
  /* align-self: flex-start; */
}
</style>
