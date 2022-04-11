<template>
  <div>
    <p id="tags-small-subtext">for instance:</p>
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
  props: ['numberOfTags'],
  data() {
    return {
      tags: [],
    };
  },
  async beforeMount() {
    const resp = await this.$axios.post('getRandomTags', {
      number: this.numberOfTags,
    });
    this.tags = resp.data.tags;
    console.log(this.tags, this.numberOfTags);
  },
  methods: {
    sendTag(tag){
      this.$emit('loadTag', tag)
    }
  }
};
</script>

<style>
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
</style>
