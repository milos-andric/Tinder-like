<template>
  <div id="history-container">
    <div id="history-title">User History</div>
    <div id="history-selectors">
      <div
        id="likes"
        class="history-buttons"
        :class="{ active: currentTopic === 'likes' }"
        @click="getLikes()"
      >
        Likes
      </div>
      <div
        id="views"
        class="history-buttons"
        :class="{ active: currentTopic === 'views' }"
        @click="getViews()"
      >
        Views
      </div>
      <div
        id="matchs"
        class="history-buttons"
        :class="{ active: currentTopic === 'matchs' }"
        @click="getMatchs()"
      >
        Matchs
      </div>
      <div
        id="matchs"
        class="history-buttons"
        :class="{ active: currentTopic === 'reports' }"
        @click="getReports()"
      >
        Reports
      </div>
      <div
        id="matchs"
        class="history-buttons"
        :class="{ active: currentTopic === 'blocks' }"
        @click="getBlocks()"
      >
        Blocks
      </div>
    </div>
    <div v-if="history.length" id="v-for-object" class="history-list">
      <div v-for="item in history" :key="item.history" class="history-entries">
        <nuxt-link :to="item.userid" class="link-to-users-in-history">{{
          item.message
        }}</nuxt-link>
      </div>
    </div>
    <div v-else class="history-list">No history for this user</div>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['userId'],
  data() {
    return {
      currentTopic: 'likes',
      history: [],
    };
  },
  async mounted() {
    const resp = await this.$axios.get('getUserLikeHistory');
    this.history = resp.data;
  },
  methods: {
    async getLikes() {
      if (this.currentTopic !== 'likes') {
        const resp = await this.$axios.get('getUserLikeHistory');
        this.currentTopic = 'likes';
        this.history = resp.data;
      }
    },
    async getViews() {
      if (this.currentTopic !== 'views') {
        const resp = await this.$axios.get('getUserViewHistory');
        this.currentTopic = 'views';
        this.history = resp.data;
      }
    },
    async getMatchs() {
      if (this.currentTopic !== 'matchs') {
        const resp = await this.$axios.get('getUserMatchHistory');
        this.currentTopic = 'matchs';
        this.history = resp.data;
      }
    },
    async getBlocks() {
      if (this.currentTopic !== 'blocks') {
        const resp = await this.$axios.get('getUserBlockHistory');
        this.currentTopic = 'blocks';
        this.history = resp.data;
      }
    },
    async getReports() {
      if (this.currentTopic !== 'reports') {
        const resp = await this.$axios.get('getUserReportHistory');
        this.currentTopic = 'reports';
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
#history-title {
  font-family: 'Haas Grot Text R Web', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
  font-weight: 500;

  color: #dc3545;
  margin-bottom: 1vh;
}
.active {
  color: #dc3545;
}
.link-to-users-in-history {
  color: rgba(0, 0, 0, 0.767);
}
</style>
