<template>
  <div class="mx-auto col-4 h-100">
    <h2>Register</h2>

    <form method="post" @submit.prevent="register">
      <div class="form-outline mb-4">
        <label class="form-label">First name</label>
        <input
          v-model="first_name"
          type="text"
          class="form-control form-control-lg"
          name="first_name"
          required
        />
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Last name</label>
        <input
          v-model="last_name"
          type="text"
          class="form-control form-control-lg"
          name="last_name"
          required
        />
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Username</label>
        <input
          v-model="user_name"
          type="text"
          class="form-control form-control-lg"
          name="user_name"
          required
        />
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Email</label>
        <input
          v-model="email"
          type="email"
          class="form-control form-control-lg"
          name="email"
          required
        />
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Password</label>
        <input
          v-model="password"
          type="password"
          class="form-control form-control-lg"
          name="password"
          required
        />
      </div>

      <div class="form-outline mb-3">
        <label class="form-label">Gender</label>
        <div class="d-flex">
          <div
            class="d-flex flex-column align-items-center justify-content-center flex-fill"
          >
            <input
              id="man"
              v-model="gender"
              type="radio"
              class="form-control form-control-lg mb-2"
              name="gender"
              value="0"
              required
            />
            <label for="man">Man</label>
          </div>

          <div
            class="d-flex flex-column align-items-center justify-content-center flex-fill"
          >
            <input
              id="woman"
              v-model="gender"
              type="radio"
              class="form-control form-control-lg mb-2"
              name="gender"
              value="1"
              required
            />
            <label for="woman">Woman</label>
          </div>
        </div>
      </div>

      <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
        {{ errorMsg }}
      </b-alert>

      <b-alert
        v-model="successStatus"
        variant="success"
        dismissible
        class="mt-3"
      >
        An email has been sent to confirm your new account
      </b-alert>

      <div class="text-lg-start mt-4 pt-2">
        <button
          type="submit"
          class="btn btn-primary btn-lg"
          style="padding-left: 2.5rem; padding-right: 2.5rem"
        >
          Register
        </button>

        <p class="small fw-bold mt-2 pt-1 mb-0">
          Already got an account? <nuxt-link to="/login">Login</nuxt-link>
        </p>
      </div>
    </form>
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
      alertStatus: false,
      successStatus: false,
      errorMsg: '',
    };
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
        });

        this.successStatus = true;
        this.alertStatus = false;
      } catch (e) {
        this.errorMsg = e.response.data.msg;
        this.successStatus = false;
        this.alertStatus = true;
      }
    },
  },
};
</script>
