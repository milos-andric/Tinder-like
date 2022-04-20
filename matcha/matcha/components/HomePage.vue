<template>
  <!-- // TODO true ?? -->
  <div v-if="true && user_name" class="mx-auto col-4 h-100" style="min-width: 300px">
    <h3 class="mt-3 text-center">Hello</h3>
    <!-- // TODO -->
    <h2 class="mt-3 text-center text-truncate text-wrap" style="width: 100%">{{ user_name }}</h2>
    <h3 class="mt-3 text-center">😉</h3>
    <div v-if="konami === true" class="mx-auto mt-5 mb-5 h-100 text-center">
        <b-img rounded alt="Circle image" src="../assets/surprise.png" class="mb-5" size="15rem">No image</b-img>
      <div>
        <b-button variant="outline-danger" @click="devilMode()">Activate privilege devil !</b-button>
      </div>
    </div>
    <p class="mt-3">Welcome to Matcha, the best place for online dating 🔥</p>
    <p>
      To help you get more dates 🗓️  think about uploading an attractive
      <nuxt-link to="/user">profile picture</nuxt-link> 😎
    </p>
    <p class="mt-3">
      You may also want to tell us more about you and what you're looking for on 
      <nuxt-link to="/me">your profile</nuxt-link> ✔️
    </p>
    </br>
    <p>
      Once your profile is completed, you may either :
      </br>
      ❤️ try to
      <nuxt-link to="/match">match</nuxt-link>
      with random people
      </br>
      🔍 try to
      <nuxt-link to="/search">search</nuxt-link> by criteria and see targeted user's profile.
    </p>
    <p>
      When you match with people, feel free to <nuxt-link to="/chat">chat</nuxt-link> with them 💬
    </p>
    <b-alert
      v-model="alertStatus"
      :variant="alertVariant"
      dismissible
      class="mt-3"
    >
      {{ alertMsg }}
    </b-alert>
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
      id: 0,
      user_name: '',
      current: 0,
      konami: false,
      load: false,

      alertStatus: false,
      alertVariant: 'error',
      alertMsg: '',
    };
  },

  async beforeMount() {
    await this.getUserInfo();
  },

  mounted() {
      document.addEventListener('keydown', this.konamiCode);
  },

  methods: {
    async getUserInfo() {
      try {
        const user = await this.$axios.get('/me');
        this.id = user.data.user_id;
        this.user_name = user.data.user_name;
        this.laod = true;
      } catch (e) {}
    },

    konamiCode(event) {
      const pattern = ['b', 'a', 't', 'm', 'a', 'n', 'e', 't'];
      if (!event || !event.key)
        return;
      if (!pattern.includes(event.key) || event.key !== pattern[this.current]) {
        this.current = 0;
        return;
	    }
      this.current++;
      if (pattern.length === this.current) {
        this.current = 0;
        this.konami = true;
        document.removeEventListener('keydown', this.konamiCode);
      }
    },

    async devilMode() {
      try {
        const res = await this.$axios.post('/devil', {
          user_id: this.id,
        });
        this.alertMsg = res.data.msg;
        this.alertVariant = 'success';
        this.alertStatus = true;
      } catch (e) {
        this.alertMsg = e.response.data.msg;
        this.alertVariant = 'danger';
        this.alertStatus = true;
      }
    }
  },
};
</script>
