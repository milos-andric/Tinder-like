<template>
  <div v-if="loadInfos" class="d-flex flex-column">
    <div class="d-flex w-100" style="height: calc(100vh - 300px)">
      <ChannelView :activeroom="room" @changeActiveRoom="onChangeActiveRoom" />

      <div class="w-100" style="flex-grow: 1">
        <div
          v-if="messages.length"
          id="message-box"
          class="w-100 chat-list pt-4"
        >
          <div
            v-for="item in messages"
            :key="item.messages"
            :class="item.sender_id === self_id ? 'myself' : 'other'"
            class="message"
          >
            <div v-if="item.type === 1">
              <p class="font-weight-bold mb-2">{{ item.user_name }}</p>
              <p>{{ item.message }}</p>
            </div>
            <div v-else-if="item.type === 2 && item.sender_id === self_id">
              <p>Vous avez envoyer une invitation à {{ otherUserName }}</p>
              {{ item.message }}
            </div>
            <div v-else-if="item.type === 2 && item.sender_id !== self_id">
              <p>Vous avez reçu une invitation de {{ item.user_name }}:</p>
              <p>
                {{ item.message }}
              </p>
              <button class="btn btn-primary" @click="accept(item)">
                Accepter
              </button>
              <button class="btn btn-primary" @click="refuse(item)">
                Refuser
              </button>
            </div>
            <div v-else-if="item.type === 3">
              <p>{{ item.message }}</p>
            </div>
          </div>
        </div>
        <div
          v-else-if="room && loadMessages"
          class="mx-auto col-sm-12 col-lg-8 h-100 overflow-auto"
        >
          <div class="bg-primary text-white rounded m-3 p-2 text-center">
            <span class="badge bg-light text-dark">
              {{ suggestions.length }}
            </span>
            suggestions
          </div>
          <div
            v-for="item in suggestions"
            :key="item.suggestions"
            class="text-center"
            @click="sendSuggestion(item)"
          >
            <button
              type="button"
              class="btn btn-secondary m-1 col-8 text-break"
            >
              <h6><span class="badge bg-light text-dark">Envoyer:</span></h6>
              {{ item }}
            </button>
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
          @keyup.enter="sendMessage()"
        />

        <template #append>
          <button class="btn btn-primary" type="submit" @click="sendMessage">
            <font-awesome-icon color="white" icon="paper-plane" />
          </button>
          <b-button v-b-modal.modal-1 class="btn btn-primary"
            ><font-awesome-icon icon="martini-glass"
          /></b-button>
        </template>
      </b-input-group>
    </div>
    <div>
      <b-modal id="modal-1" hide-footer title="Date Form">
        <b-form-datepicker
          id="date"
          v-model="date"
          class="mb-2"
          locale="fr"
          today-button
          reset-button
          close-button
        ></b-form-datepicker>
        <b-form-timepicker
          id="hour_date"
          v-model="dateHour"
          class="mb-2"
          locale="fr"
          now-button
          reset-button
          close-button
        ></b-form-timepicker>
        <b-form-textarea
          id="textarea"
          v-model="dateLocation"
          placeholder="Enter Location"
          rows="3"
          max-rows="6"
        ></b-form-textarea>
        <b-button class="mt-2" @click="abortDate">Cancel</b-button>
        <b-button variant="primary" class="mt-2" @click="sendDate"
          >Send date</b-button
        >
      </b-modal>
    </div>
  </div>
  <div v-else class="text-center">
    <b-spinner
      variant="primary"
      style="width: 5rem; height: 5rem"
      label="Large Spinner Text Centered"
    ></b-spinner>
  </div>
</template>

<script>
export default {
  data() {
    return {
      self_id: null,
      room: '',
      otherUserName: '',
      input: '',
      messages: [],
      suggestions: [
        'Hello ! Your pictures are beautiful 🥵🥵 ! I love your interests too 🤩 , tell me more about it ! 👂',
        'Hey 👋 ! Nice to meet you ! Matcha Corp. organizes a party 🥳 and I need a +1 ! are you intrested 😉 ?',
        "Hi, excuse me but my phone has a huge problem 😱 ... It dosen't have you number ❤️ , give me your 06 ! 🎯",
      ],
      loadInfos: false,
      loadMessages: false,
      date: undefined,
      dateHour: undefined,
      dateLocation: undefined,
    };
  },
  async mounted() {
    const me = await this.$axios.get('/me');
    this.self_id = me.data.user_id;
    this.loadInfos = true;

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
        if (data.type === 3) {
          this.getMessage(this.room);
        } else {
          this.messages.push(data);
          this.scrollToLast();
        }
      }
    });
  },
  methods: {
    async getMessage(room) {
      const resp = await this.$axios.post('getRoomMessages', {
        room,
      });
      this.messages = resp.data;
      this.loadMessages = true;
      if (this.messages.length) {
        this.scrollToLast();
      }
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
    async onChangeActiveRoom(newRoom, otherUserName) {
      this.room = newRoom;
      this.otherUserName = otherUserName;
      await this.getMessage(newRoom);
    },
    scrollToLast() {
      setTimeout(() => {
        const box = document.getElementById('message-box');
        const target = box.lastElementChild;
        target.scrollIntoView();
      }, 10);
    },
    async sendDate() {
      const val = await this.$bvModal.msgBoxConfirm(
        'Are you sure to send date to ' + this.otherUserName + '  ?'
      );
      if (val && this.date && this.dateHour && this.dateLocation) {
        this.$bvModal.hide('modal-1');
        await this.$axios.post('/proposeDate', {
          date: this.date,
          hour: this.dateHour,
          location: this.dateLocation,
          room: this.room,
        });
        this.date = '';
        this.dateHour = '';
        this.dateLocation = '';
      } else if (val) {
        this.$bvModal.msgBoxOk('Bad input', {
          contentClass: 'textRed',
          okVariant: 'warning',
        });
      }
    },
    abortDate() {
      this.$bvModal.hide('modal-1');
    },
    async accept(msg) {
      await this.$axios.post('acceptDate', {
        message: msg,
        resp: true,
      });
      this.getMessage(this.room);
    },
    async refuse(msg) {
      await this.$axios.post('acceptDate', {
        message: msg,
        resp: false,
      });
      this.getMessage(this.room);
    },
    async sendSuggestion(message) {
      this.input = message;
      await this.sendMessage();
    },
  },
};
</script>

<style>
#message-box {
  background: white;
}
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
  overflow-wrap: break-word;
  max-width: 50%;
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
.textRed {
  color: red;
}
</style>
