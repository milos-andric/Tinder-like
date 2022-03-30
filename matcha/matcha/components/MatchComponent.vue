<template>
  <div v-if="name !== undefined && name !== ''">
    <div id="wrapper-match">
      <div id="match-photo">
        <ShowProfilePic />
        <h2 id="name-age-match">
          {{ name + ', ' + age }}
        </h2>
      </div>
      <div id="match-buttons">
        <font-awesome-icon
          id="icon-match-dislike"
          class="btn-match"
          icon="circle-xmark"
          @click="dislike()"
        />
        <font-awesome-icon
          id="icon-match-like"
          class="btn-match"
          icon="fire"
          @click="like()"
        />
      </div>
    </div>
  </div>
  <div v-else-if="name !== ''">
    No more matches, go get some pussies elsewhere
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
}
#match-photo {
  position: relative;
  width: 80%;
  min-width: 420px;
  max-width: 1000px;
  height: 60%;
}
#match-buttons {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 60%;
  min-width: 420px;
  max-width: 750px;
  height: 10%;
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
#name-age-match {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
.btn-match {
  cursor: grab;
}
</style>
