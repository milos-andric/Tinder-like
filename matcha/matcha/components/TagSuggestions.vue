<template>
  <div>
    <div id="instances">
      <p id="tags-small-subtext">for instance:</p>
      <span
        class="refreshTags"
        :class="{ clicked: isClicked }"
        @click="getTags()"
        ><font-awesome-icon
          icon="arrow-rotate-right"
          style="align-self: center"
      /></span>
    </div>
    <div id="tags-suggestions">
      <span
        v-for="item in tags"
        :key="item.label"
        class="tags-suggestions-units"
        @click="sendTag(item.label)"
      >
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['numberOfTags'],
  data() {
    return {
      isClicked: false,
      tags: [],
    };
  },
  async beforeMount() {
    await this.getTags();
  },
  methods: {
    async getTags() {
      this.hasBeenClicked();
      const resp = await this.$axios.post('getRandomTags', {
        number: this.numberOfTags,
      });
      this.tags = resp.data.tags;
    },
    sendTag(tag) {
      this.$emit('loadTag', tag);
    },
    hasBeenClicked() {
      this.isClicked = true;
      setTimeout(() => {
        this.isClicked = false;
      }, 250);
    },
  },
};
</script>

<style>
#instances {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}
#tags-small-subtext {
  font-size: 70%;
  color: rgba(0, 0, 0, 0.418);
}
#tags-suggestions {
  display: flex;
  flex-flow: row wrap;
  margin-top: 3%;
  margin-bottom: 3%;
}
.tags-suggestions-units {
  padding: 3px 5px;
  margin-right: 2%;
  margin-bottom: 2%;
  font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  border-radius: 6px;
  border: none;

  background: #6e6d70;
  box-shadow: 0px 0.5px 1px rgba(0, 0, 0, 0.1),
    inset 0px 0.5px 0.5px rgba(255, 255, 255, 0.5),
    0px 0px 0px 0.5px rgba(0, 0, 0, 0.12);
  color: #dfdedf;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
.tags-suggestions-units:hover {
  box-shadow: inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2),
    0px 0.5px 1px rgba(0, 0, 0, 0.1), 0px 0px 0px 3.5px rgba(58, 108, 217, 0.5);
  outline: 0;
}
.refreshTags {
  display: flex;
  justify-content: center;
  flex-direction: column;

  height: 2rem;
  border-radius: 50%;
  border: solid black 1px;
  color: black;
  background-color: white;
  padding: 3px;
  width: 2rem;
  cursor: pointer;
}
.refreshTags:hover {
  box-shadow: inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2),
    0px 0.5px 1px rgba(0, 0, 0, 0.1), 0px 0px 0px 3.5px rgba(58, 108, 217, 0.5);
  outline: 0;
}
.clicked {
  transform: rotate(1turn);
  transition-property: background-color font-size transform color;
  transition-timing-function: ease-out;
  transition-duration: 0.25s;
}
</style>
