<template>
  <div class="column is-4 is-offset-4">
    <h2 class="title has-text-centered">Register!</h2>

    <form method="post" @submit.prevent="register">

      <div class="field">
        <label class="label">First name</label>
        <div class="control">
          <input v-model="firstName" type="text" class="input" name="firstName" required />
        </div>
      </div>

      <div class="field">
        <label class="label">Last name</label>
        <div class="control">
          <input v-model="lastName" type="text" class="input" name="lastName" required />
        </div>
      </div>

      <div class="field">
        <label class="label">Username</label>
        <div class="control">
          <input v-model="userName" type="text" class="input" name="userName" required />
        </div>
      </div>

      <div class="field">
        <label class="label">Email</label>
        <div class="control">
          <input v-model="email" type="email" class="input" name="email" required />
        </div>
      </div>

      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input v-model="password" type="password" class="input" name="password" required />
        </div>
      </div>

      <div class="field">
        <label class="label">Gender</label>
        <div class="control">
          <label for="man">Man</label>
          <input id="man" v-model="gender" type="radio" class="input"  name="gender" value="0"  required />

          <label for="woman">Woman</label>
          <input id="woman" v-model="gender" type="radio" class="input" name="gender" value="1" required />
        </div>
      </div>

      <div class="control">
        <button type="submit" class="button is-dark is-fullwidth">Register</button>
      </div>
    </form>

    <div class="has-text-centered" style="margin-top: 20px">
      Already got an account? <nuxt-link to="/login">Login</nuxt-link>
    </div>
  </div>
</template>

<script>

export default {

  data() {
    return {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      gender: 0,
      error: null,
    }
  },

  methods: {
    async register() {
      try {
        await this.$axios.post('register', {
          firstName: this.first_name,
          lastName: this.last_name,
          userName: this.username,
          email: this.email,
          password: this.password,
          gender: this.gender,
        })

        this.$router.push('/')
      } catch (e) {
        this.error = e.response.data.message
      }
    }
  }
}
</script>