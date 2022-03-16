<template>
  <div class="mx-auto col-4 h-100">
    <h2>Recover password</h2>

    <form method="post" @submit.prevent="recover">
      <div class="form-outline mb-3">
        <label for="usernameInput" class="form-label">Username</label>
        <input
          id="usernameInput"
          v-model="username"
          type="text"
          class="form-control form-control-lg"
          name="username"
          required
        />
      </div>

      <div class="text-lg-start mt-2 pt-2">
        <button
          type="submit"
          class="btn btn-primary btn-lg"
          style="padding-left: 2.5rem; padding-right: 2.5rem"
        >
          Recover
        </button>

        <p class="small fw-bold mt-2 pt-1 mb-0">
          You actually remember? <nuxt-link to="/login">Login</nuxt-link>
        </p>

        <p class="small fw-bold mt-2 pt-1 mb-0">
          Don't have an account? <nuxt-link to="/register">Register</nuxt-link>
        </p>
      </div>
    </form>

    <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
      {{ errorMsg }}
    </b-alert>

    <b-alert v-model="successStatus" variant="success" dismissible class="mt-3">
      An email has been sent to your mail address
    </b-alert>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      alertStatus: false,
      successStatus: false,
      errorMsg: '',
    };
  },
  methods: {
    async recover() {
      try {
        await this.$axios.post('recover', {
          username: this.username,
        })
        this.successStatus = true
        this.alertStatus = false
      } catch (e) {
        this.errorMsg = e.response.data.msg
        this.alertStatus = true
        this.successStatus = false
      }
    },
  },
};
</script>
