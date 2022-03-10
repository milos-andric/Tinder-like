<template>
  <div class="column is-4 is-offset-4">
    <h2 class="title has-text-centered">Register!</h2>

    <form method="post" @submit.prevent="register">

      <div class="field">
        <label class="label">First name</label>
        <div class="control">
          <input v-model="first_name" type="text" class="input" name="first_name" required />
        </div>
      </div>

      <div class="field">
        <label class="label">Last name</label>
        <div class="control">
          <input v-model="last_name" type="text" class="input" name="last_name" required />
        </div>
      </div>

      <div class="field">
        <label class="label">Username</label>
        <div class="control">
          <input v-model="user_name" type="text" class="input" name="user_name" required />
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
      first_name: '',
      last_name: '',
      user_name: '',
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
          first_name: this.first_name,
          last_name: this.last_name,
          user_name: this.user_name,
          email: this.email,
          password: this.password,
          gender: this.gender,
        })
        console.log("hellooooooo");

        this.$router.push('/')
      } catch (e) {
        this.error = e.response.data.message
      }
    }
  }
}
</script>