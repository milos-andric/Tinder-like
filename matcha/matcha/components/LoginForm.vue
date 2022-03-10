<template>
  <div class="column is-4 is-offset-4">
    <h2 class="title has-text-centered">Login!</h2>

    <form method="post" @submit.prevent="login">

      <div class="field">
        <label class="label">Username</label>
        <div class="control">
          <input v-model="username" type="text" class="input" name="username" required />
        </div>
      </div>

      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input v-model="password" autocomplete="current-password" type="password" class="input" name="password" required />
        </div>
      </div>

      <div class="control">
        <button type="submit" class="button is-dark is-fullwidth">
          Register
        </button>
      </div>
    </form>

    <div class="has-text-centered" style="margin-top: 20px">
      No account? <nuxt-link to="/register">Register</nuxt-link>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      username: '',
      password: '',
      error: null
    }
  },

  methods: {
    async login() {
      try {
        await this.$axios.post('login', {
          username: this.username,
          password: this.password
        })

        this.$router.push('/')
      } catch (e) {
        this.error = e.response.data.message
      }
    }
  }
}
</script>