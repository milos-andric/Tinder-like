<template>
  <div id="wrapper-match">
    <div id="match-photo">
      <div id="name-age-match">
        {{ name + ', ' + age }}
      </div>
      <ShowProfilePic />
    </div>
    <div id="match-buttons">
      <font-awesome-icon
        id="icon-match-dislike"
        icon="circle-xmark"
        @click="dislike()"
      />
      <font-awesome-icon id="icon-match-like" icon="fire" @click="like()" />
    </div>
  </div>
</template>

<script>
import ShowProfilePic from './ShowProfilePic.vue';
export default {
  components: { ShowProfilePic },
  data() {
    return {
      name: '',
      age: 0,
      targetId: 0,
    };
  },
  async beforeMount() {
    await this.loadMatch();
  },
  methods: {
    async like() {
      await this.$axios.post('like', {
        data: {
          targetId: this.targetId,
        },
      });
      await this.loadMatch();
    },
    async dislike() {
      await this.$axios.post('view', {
        data: {
          targetId: this.targetId,
        },
      });
      await this.loadMatch();
    },
    async loadMatch() {
      await this.$axios.post('getRecommandation', {}).then(r => {
        this.name = r.data.first_name;
        this.age = r.data.age;
        this.targetId = r.data.user_id;
      });
    },
  },
};
</script>

<style>
#wrapper-match {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-width: 420px;
  height: 80vh;
  background-color: pink;
}
#match-photo {
  width: 80%;
  min-width: 420px;
  max-width: 1000px;
  height: 60%;
  background-color: aquamarine;
}
#match-buttons {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 60%;
  min-width: 420px;
  max-width: 750px;
  height: 10%;
  background-color: rosybrown;
}
#icon-match-like {
  width: 25%;
  height: 80%;
  color: greenyellow;
}
#icon-match-dislike {
  width: 25%;
  height: 80%;
  color: rgb(255, 85, 47);
}
</style>
