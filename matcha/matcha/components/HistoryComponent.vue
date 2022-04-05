<template>
  <div id="history-container">
    <div id="history-selectors">
      <div id="likes" class="history-buttons" @click="getLikes()">likes</div>
      <div id="views" class="history-buttons" @click="getViews()">views</div>
      <div id="matchs" class="history-buttons" @click="getMatchs()">matchs</div>
    </div>
    <div v-if="history.length" id="v-for-object" class="history-list">
      <div v-for="item in history" :key="item.history" class="history-entries">
        {{ item }}
      </div>
    </div>
    <div v-else>No history for this user</div>
  </div>
</template>

<script>
export default {
  props: ['userId'],
  data() {
    return {
      currentTopic: 'likes',
      history: [],
    };
  },
  async mounted() {
    const resp = await this.$axios.post('getUserLikeHistory', {
      userId: this.userId,
    });
    this.history = resp.data;
  },
  methods: {
    async getLikes() {
      if (this.currentTopic !== 'likes') {
        const resp = await this.$axios.post('getUserLikeHistory', {
          userId: this.userId,
        });
        this.currentTopic = 'likes';
        this.history = resp.data;
      }
    },
    async getViews() {
      if (this.currentTopic !== 'views') {
        const resp = await this.$axios.post('getUserViewHistory', {
          userId: this.userId,
        });
        this.currentTopic = 'views';
        this.history = resp.data;
      }
    },
    async getMatchs() {
      if (this.currentTopic !== 'matchs') {
        const resp = await this.$axios.post('getUserMatchHistory', {
          userId: this.userId,
        });
        this.currentTopic = 'matchs';
        this.history = resp.data;
      }
    },
  },
};
</script>

<style>
#history-container {
  max-width: 720px;
  margin-right: auto;
  margin-left: auto;
  margin-top: 5vh;
  /* border: 1px solid rgba(0, 0, 0, 0.226); */
}
#history-selectors {
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  margin-bottom: 1vh;
  /* border-bottom: 1px solid rgba(0, 0, 0, 0.226); */
}
.history-buttons {
  background-color: rgba(51, 51, 51, 0.05);
  border-radius: 8px;
  border-width: 0;
  color: #333333;
  cursor: pointer;
  display: inline-block;
  font-family: 'Haas Grot Text R Web', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  list-style: none;
  margin: 0;
  padding: 10px 12px;
  text-align: center;
  transition: all 200ms;
  vertical-align: baseline;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
.history-list {
  height: 10vh;
  overflow-y: scroll;
  overflow-wrap: break-word;
}
.history-entries {
  border-bottom: 1px solid rgba(0, 0, 0, 0.247);
}
</style>
