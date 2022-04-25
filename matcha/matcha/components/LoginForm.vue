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
          class="btn btn-primary btn-lg ml-5"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-google"
            viewBox="0 0 16 16"
          >
            <path
              d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"
            /></svg
        ></a>

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
    let res;
    try {
      if (this.$route.query.code) {
        res = await this.$axios.post('/googleAuth', {
          code: this.$route.query.code,
        });
        this.$auth.setUserToken(res.data.token);
        this.$router.push('/me');
      }
    } catch (e) {
      this.$nuxt.context.error({
        status: 409,
      });
    }
  },
  methods: {
    googleAuth() {
      this.$auth.loginWith('social');
    },
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
