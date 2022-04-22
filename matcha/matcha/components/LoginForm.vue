<template>
  <div class="mx-auto col-sm-6 col-lg-4 h-100">
    <h2>Login</h2>

    <form method="post" @submit.prevent="login">
      <div class="form-outline mb-4">
        <label for="usernameInput" class="form-label">Username</label>
        <input
          id="usernameInput"
          v-model="username"
          autocomplete="username"
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
        <nuxt-link to="/recover" class="text-primary"
          >Forgot password?</nuxt-link
        >
      </div>

      <div class="text-lg-start mt-4 pt-2">
        <button
          type="submit"
          class="btn btn-primary btn-lg"
          style="padding-left: 2.5rem; padding-right: 2.5rem"
        >
          Login
        </button>

        <a
          href="https://accounts.google.com/o/oauth2/v2/auth?client_id=154688020943-qggb8idvqclbq5r4t9huhg5msd0ik4r3.apps.googleusercontent.com&scope=email&redirect_uri=http://localhost:8000&auth_type=rerequest&display=popup&response_type=code"
          >aled</a
        >

        <p class="small fw-bold mt-2 pt-1 mb-0">
          Don't have an account? <nuxt-link to="/register">Register</nuxt-link>
        </p>
      </div>
    </form>

    <b-alert v-model="successStatus" variant="success" dismissible class="mt-3">
      Your account has been successfully verified
    </b-alert>
    <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
      {{ errorMsg }}
    </b-alert>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',

      successStatus: Boolean(this.$route.query.activate),
      alertStatus: false,
      errorMsg: '',
    };
  },
  async beforeMount() {
    if (this.$route.query.code)
      await this.$axios.post('/googleAuth', {
        code: this.$route.query.code,
      });
  },
  methods: {
    async login() {
      try {
        await this.$auth.loginWith('local', {
          data: {
            username: this.username,
            password: this.password,
          },
        });
        this.$router.push('/');
      } catch (e) {
        this.successStatus = false;
        this.alertStatus = true;
        this.errorMsg = e.response.data.msg;
      }
    },
  },
};
</script>
