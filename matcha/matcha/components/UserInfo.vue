<template>
  <div v-if="loadUser" class="mx-auto col-10 h-100 text-center">
    <!-- User main info -->
    <b-avatar v-if="profile_pic" size="20vw" :src="profile_pic.url"></b-avatar>
    <b-avatar v-else size="15vw"></b-avatar>
    <h2 class="mt-3">{{ first_name + ' ' + last_name }}</h2>
    <h4 v-if="(user_name !== '' && online === true) || id === self_id">
      Connected
    </h4>
    <h4 v-else-if="user_name !== ''">Last connexion: {{ last_connexion }}</h4>

    <div v-if="loadLike" v-b-tooltip.hover title="This user has liked you">
      <font-awesome-icon
        v-if="likedback"
        id="icon-liked"
        icon="thumbs-up"
        style="font-size: 1.5em"
      />
    </div>
    <div
      v-if="loadLike"
      v-b-tooltip.hover
      title="You have matched with this user"
    >
      <font-awesome-icon
        v-if="matched"
        id="icon-matched"
        icon="handshake-simple"
        style="font-size: 1.5em"
      />
    </div>

    <!-- Bio -->
    <blockquote class="blockquote mt-5">
      <p>{{ bio }}</p>
    </blockquote>

    <!-- Tags -->
    <h4 class="mt-3">
      <b-badge class="py-2 px-3" variant="dark">
        <font-awesome-icon icon="star" /> {{ score }}
      </b-badge>
      <b-badge v-if="birth_date" class="py-2 px-3" variant="dark">
        <font-awesome-icon icon="cake-candles" />
        {{ new Date().getFullYear() - birth_date.getFullYear() }}
      </b-badge>
      <b-badge v-if="!gender" class="py-2 px-3" variant="dark">
        <font-awesome-icon icon="mars" /> Male
      </b-badge>
      <b-badge v-else class="py-2 px-3" variant="dark">
        <font-awesome-icon icon="venus" /> Female
      </b-badge>
      <b-badge class="py-2 px-3" variant="dark">
        <font-awesome-icon :icon="getOrientationIcon()" />
        {{ getOrientation() }}
      </b-badge>
      <b-badge v-for="tag in tags" :key="tag" class="py-2 px-3 m-1">
        {{ tag }}
      </b-badge>
    </h4>

    <!-- Privilege action -->
    <!-- SUJET FR != SUJET EN >> condition si utilisateur a une photo OU si target a une photo
    v-if="self_profile_pic !== null && profile_pic !== null && liked === false"
    -->
    <div
      v-if="
        loadLike &&
        id !== self_id &&
        profile_pic !== null &&
        seld_privilege === true
      "
      class="mt-3 mb-3"
    >
      <!-- SUJET FR != SUJET EN >> condition si utilisateur a une photo OU si target a une photo
      v-if="
          id !== self_id &&
          self_profile_pic !== null &&
          profile_pic !== null &&
          likedback === false &&
          matched === false
        "
      -->
      <b-button
        v-if="
          id !== self_id &&
          profile_pic !== null &&
          likedback === false &&
          matched === false
        "
        variant="outline-danger"
        @click="devilMatch()"
      >
        Devil Match !
      </b-button>
    </div>

    <!-- User links -->
    <div v-if="id === self_id">
      <b-link class="mr-3" to="/me">Edit personal info</b-link>
      |
      <b-link class="ml-3" to="/security">Change password</b-link>
    </div>

    <!-- Gallery -->
    <b-container class="my-5 p-3">
      <div v-if="images.length" class="d-flex flex-wrap justify-content-center">
        <div
          v-for="image in images"
          :key="image.image_id"
          class="position-relative"
        >
          <b-img-lazy
            :src="image.url"
            style="height: 250px"
            class="m-2 shadow bg-body rounded"
            alt="Image 1"
          >
          </b-img-lazy>
        </div>
      </div>
      <div v-else>
        <font-awesome-icon
          color="black"
          class="mb-2"
          style="font-size: 75px"
          icon="image"
        />
        <h3>No image yet</h3>
      </div>
    </b-container>

    <!-- Actions -->
    <b-container v-if="id !== self_id" fluid>
      <!-- Report button -->
      <b-button
        v-b-modal.report
        v-b-tooltip.hover.top="'Report user as bot'"
        class="shadow-lg mx-1"
        variant="light"
        style="border-radius: 3em; width: 5em; height: 5em"
      >
        <font-awesome-icon
          class="text-danger"
          icon="robot"
          style="font-size: 2em"
        />
      </b-button>

      <!-- Like button -->
      <!-- SUJET FR != SUJET EN >> condition si utilisateur a une photo OU si target a une photo
      v-if="self_profile_pic !== null && profile_pic !== null && liked === false"
      -->
      <b-button
        v-if="profile_pic !== null && liked === false"
        v-b-tooltip.hover.top="'Like user'"
        class="shadow-lg btn-lg mx-1"
        variant="light"
        style="border-radius: 3em; width: 5em; height: 5em"
        @click="like"
      >
        <font-awesome-icon
          class="text-dark"
          icon="heart"
          style="font-size: 3em"
        />
      </b-button>

      <b-button
        v-else-if="
          profile_pic !== null && profile_pic !== null && liked === true
        "
        v-b-tooltip.hover.top="'Unlike user'"
        class="shadow-lg btn-lg mx-1"
        variant="light"
        style="border-radius: 3em; width: 5em; height: 5em"
        @click="unlike"
      >
        <font-awesome-icon
          class="text-dark"
          icon="thumbs-down"
          style="font-size: 3em"
        />
      </b-button>

      <!-- Block button -->
      <b-button
        v-b-modal.block
        v-b-tooltip.hover.top="'Block user'"
        class="shadow-lg mx-1"
        variant="light"
        style="border-radius: 3em; width: 5em; height: 5em"
      >
        <font-awesome-icon
          class="text-danger"
          icon="ban"
          style="font-size: 2em"
        />
      </b-button>
    </b-container>

    <!-- Actions if self -->
    <b-container v-else fluid>
      <b-button
        v-b-tooltip.hover.top="'Edit profile'"
        class="shadow-lg btn-lg mx-3"
        variant="light"
        style="border-radius: 3em; width: 5em; height: 5em"
        @click="goToProfile"
      >
        <font-awesome-icon
          class="text-dark"
          icon="pen-to-square"
          style="font-size: 2.5em"
        />
      </b-button>
    </b-container>

    <!-- Report modals -->
    <b-modal
      id="report"
      title="Report as robot"
      @ok="userAction('/user-report')"
    >
      <p class="text-center my-4">
        <font-awesome-icon icon="robot" style="font-size: 2em" />
      </p>
      <p class="text-center my-4">Report this user as a robot ?</p>
    </b-modal>

    <!-- Block modals -->
    <b-modal id="block" title="Block user" @ok="userAction('/user-block')">
      <p class="text-center my-4">
        <font-awesome-icon icon="ban" style="font-size: 2em" />
      </p>
      <p class="text-center my-4">
        By blocking this user, we will not display them to you anymore and you
        will not get notification from them
      </p>
    </b-modal>

    <b-alert
      v-model="alertStatus"
      :variant="alertVariant"
      dismissible
      class="mt-3"
    >
      {{ alertMsg }}
    </b-alert>
    <HistoryComponent v-if="self_id === id" />
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
      self_id: 0,
      self_profile_pic: null,
      seld_privilege: false,
      likedback: false,
      matched: false,

      id: Number(this.$route.params.id),
      first_name: '',
      last_name: '',
      user_name: '',
      birth_date: null,
      gender: 0,
      orientation: 2,
      bio: '',
      tags: [],
      score: 0,
      online: true,
      last_connexion: '',
      profile_pic: null,

      loadUser: false,
      loadLike: false,

      images: [],

      alertStatus: false,
      alertVariant: 'error',
      alertMsg: '',

      liked: false,
    };
  },
  async beforeMount() {
    await this.$axios.get('/me').then(e => {
      this.self_id = e.data.user_id;
      this.self_profile_pic = e.data.profile_pic;
      this.seld_privilege = e.data.privilege;
    });
    await this.getInfos();
    this.loadUser = true;
    await this.isliked();
    await this.$axios.get('/user-images/' + this.id).then(e => {
      this.images = e.data;
    });
    await this.additionalInfos();
  },
  async mounted() {
    this.socket = this.$store.socket;
    this.socket.on('online', async usersOnline => {
      const found = usersOnline.find(e => Number(e) === this.id);
      if (found) this.online = true;
      else {
        await this.getInfos();
        this.online = false;
      }
    });
    await this.$axios.post('/view', { targetId: this.id });
  },

  methods: {
    async getInfos() {
      await this.$axios.get('/user/' + this.id).then(e => {
        this.first_name = e.data.first_name;
        this.last_name = e.data.last_name;
        this.user_name = e.data.user_name;
        this.gender = e.data.gender;
        this.orientation = e.data.orientation;
        this.bio = e.data.bio;
        this.tags = e.data.tags;
        this.last_connexion = e.data.last_connexion;
        this.profile_pic = e.data.profile_pic;
        this.privilege = e.data.privilege;
        if (e.data.age) this.birth_date = new Date(e.data.age);
      });
    },

    getOrientationIcon() {
      if (this.orientation === 0) return 'mars';
      else if (this.orientation === 2) return 'venus-mars';
      else return 'venus';
    },
    getOrientation() {
      if (this.orientation === 2) return 'Bi';
      else if (this.orientation === this.gender) return 'Gay';
      else return 'Straight';
    },
    async userAction(route) {
      try {
        const res = await this.$axios.post(route, {
          receiver: this.id,
        });
        this.alertMsg = res.data.msg;
        this.alertVariant = 'success';
        this.alertStatus = true;
      } catch (e) {
        this.alertMsg = e.response.data.msg;
        this.alertVariant = 'danger';
        this.alertStatus = true;
      }
    },

    async additionalInfos() {
      try {
        const res = await this.$axios.get('/user-informations/' + this.id);
        if (res.data?.liked) {
          this.likedback = res.data.liked;
          this.matched = res.data.matched;
        }
        this.loadLike = true;
      } catch (e) {
        this.likedback = false;
      }
    },

    async isliked() {
      try {
        await this.$axios.get('/is-liked/' + this.id).then(e => {
          this.liked = e.data;
        });
        this.alertStatus = false;
      } catch (e) {
        this.alertMsg = e.response.data.msg;
        this.alertVariant = 'danger';
        this.alertStatus = true;
      }
    },

    async like() {
      try {
        await this.$axios.post('like', {
          targetId: this.id,
        });
        this.alertStatus = false;
      } catch (e) {
        this.alertMsg = e.response.data.msg;
        this.alertVariant = 'danger';
        this.alertStatus = true;
      }
      this.isliked();
    },

    async unlike() {
      try {
        await this.$axios.post('unlike', {
          targetId: this.id,
        });
        this.alertStatus = false;
      } catch (e) {
        this.alertMsg = e.response.data.msg;
        this.alertVariant = 'danger';
        this.alertStatus = true;
      }
      this.isliked();
    },

    async devilMatch() {
      try {
        const res = await this.$axios.post('devil-match', {
          targetId: this.id,
        });
        this.alertMsg = res.data.msg;
        this.alertVariant = 'success';
        this.alertStatus = true;
      } catch (e) {
        this.alertMsg = e.response.data.msg;
        this.alertVariant = 'danger';
        this.alertStatus = true;
      }
    },

    goToProfile() {
      this.$router.push('/user');
    },
  },
};
</script>

<style>
#icon-matched {
  cursor: pointer;
  color: greenyellow;
}
#icon-liked {
  cursor: pointer;
  color: rgb(255, 85, 47);
}
</style>
