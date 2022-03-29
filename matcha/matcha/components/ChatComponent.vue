<template>
  <div>
    <div id="chat-wrapper">
      <div id="chat-channels">
        <div class="channel active">Linda</div>
        <div class="channel">Sophiedelasalope</div>
        <div class="channel">Clarrisse</div>
      </div>
      <div id="chat-box">
        <div id="v-for-object" class="chat-list">
          <div
            v-for="item in messages"
            :key="item.messages"
            class="chat-message me"
          >
            <!-- // v-if en fonction de si on est le sender ou non -->
            {{ item.sender_id + ' - ' + item.message }}
          </div>
        </div>
      </div>
    </div>
    <div id="chat-submit">
      <input v-model="input" type="text" />
      <button type="submit" @click="sendMessage()">submit</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      input: '',
      messages: [],
    };
  },
  async beforeCreate() {
    const resp = await this.$axios.get('getRoomMessages', {
      room: 'general',
    });
    this.messages = resp.data;
  },
  methods: {
    async sendMessage() {
      const resp = await this.$axios.post('sendRoomMessages', {
        room: 'general',
        message: this.input,
      });
      this.messages.push(resp.data);
      this.input = '';
    },
  },
};
</script>

<style>
#chat-wrapper {
  display: flex;
  flex-direction: row;
  height: 70vh;
}
.chat-list {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
}
#chat-box {
  margin-left: 5vw;
  width: 85vw;
  overflow-wrap: break-word;
  overflow-y: scroll;
  background-color: pink;
}
#chat-channels {
  width: 10vw;
  min-width: 100px;
  overflow-wrap: break-word;
  overflow-y: scroll;
  background-color: paleturquoise;
}
#chat-submit {
  margin-left: 15vw;
}
.channel {
  font-style: oblique;
  margin: 5%;
  border: 1px solid rgba(0, 0, 0, 0.281);
}
.active {
  background-color: rgba(0, 0, 0, 0.856);
  color: rgba(250, 235, 215, 0.733);
  font-style: normal;
}
.me {
  background-color: rgba(0, 110, 255, 0.438);
  border-radius: 10px;
}
.channel:hover {
  cursor: pointer;
}
.chat-message {
  font-family: 'Helvetica', 'Lucida Sans Unicode', 'Lucida Grande',
    'Lucida Sans', Arial, sans-serif;
  margin-top: 2vh;
  /* align-self: flex-start; */
}
</style>
