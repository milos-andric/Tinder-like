<template>
  <div id="chat-wrapper">
    <div id="chat-list">
      <ul id="v-for-object" class="demo">
        <li v-for="item in messages" :key="item.messages">
          {{ item }}
        </li>
      </ul>
    </div>
    <div id="chat-submit">
      <input type="text" v-model="input" />
      <button type="submit" @click="sendMessage()">submit</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      input: '',
      messages: ['hello', 'goddamn'],
    };
  },
  methods: {
    sendMessage() {
      if (this.input.length !== 0) {
        this.messages.push(this.input);
        this.input = '';
      }
    },
  },
};
</script>

<style>
#chat-wrapper {
  background-color: aquamarine;
}
#chat-list {
  background-color: pink;
}
#chat-submit {
  background-color: paleturquoise;
}
</style>
