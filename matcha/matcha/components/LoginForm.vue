<template>
  <div class="mx-auto col-4 h-100">
    <h2>Login</h2>

    <form method="post" @submit.prevent="login">
      <div class="form-outline mb-4">
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

      <div class="form-outline mb-3">
        <label for="passwordInput" class="form-label">Password</label>
        <input
          id="passwordInput"
          v-model="password"
          autocomplete="current-password"
          type="password"
          class="form-control form-control-lg"
          name="password"
          required
        />
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <!-- Checkbox -->
        <div class="form-check mb-0">
          <input
            class="form-check-input me-2"
            type="checkbox"
            value=""
            id="form2Example3"
          />
          <label class="form-check-label" for="form2Example3">
            Remember me
          </label>
        </div>
        <a href="#!" class="text-primary">Forgot password?</a>
      </div>

      <div class="text-lg-start mt-4 pt-2">
        <button
          type="submit"
          class="btn btn-primary btn-lg"
          style="padding-left: 2.5rem; padding-right: 2.5rem"
        >
          Login
        </button>

        <p class="small fw-bold mt-2 pt-1 mb-0">
          Don't have an account? <nuxt-link to="/register">Register</nuxt-link>
        </p>
      </div>
    </form>

    <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
      {{ this.errorMsg }}
    </b-alert>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      alertStatus: false,
      errorMsg: '',
    }
  },

  methods: {
    async login() {
      await this.$axios
        .post('login', {
          username: this.username,
          password: this.password,
        })
        .then((e) => {
          localStorage.setItem('token', e.data.token)
          localStorage.setItem('username', this.username)

          this.$router.push('/match')
        })
        .catch((e) => {
          this.alertStatus = true
          this.errorMsg = e.response.data.msg
        })
    },
  },
}
</script>
