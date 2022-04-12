<template>
  <div class="mx-auto col-sm-6 col-lg-4 h-100">
    <h2>Change password</h2>

    <form method="post" @submit.prevent="changePassword">
      <div class="form-outline mb-3">
        <label for="oldPass" class="form-label">Current password</label>
        <input
          id="oldPass"
          v-model="oldPass"
          type="password"
          class="form-control form-control-lg"
          name="oldPass"
          required
        />
      </div>

      <div class="form-outline mb-3">
        <label for="newPass" class="form-label">New password</label>
        <input
          id="newPass"
          v-model="newPass"
          type="password"
          class="form-control form-control-lg"
          name="newPass"
          required
        />
      </div>

      <div class="form-outline mb-3">
        <label for="secPass" class="form-label">Confirm password</label>
        <input
          id="secPass"
          v-model="secPass"
          type="password"
          class="form-control form-control-lg"
          name="secPass"
          required
        />
      </div>

      <div class="text-lg-start mt-2 pt-2">
        <button
          type="submit"
          class="btn btn-primary btn-lg"
          style="padding-left: 2.5rem; padding-right: 2.5rem"
        >
          Change
        </button>
      </div>
    </form>

    <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
      {{ errorMsg }}
    </b-alert>

    <b-alert v-model="successStatus" variant="success" dismissible class="mt-3">
      Password successfully updated
    </b-alert>
  </div>
</template>

<script>
export default {
  data() {
    return {
      oldPass: '',
      newPass: '',
      secPass: '',
      alertStatus: false,
      successStatus: false,
      errorMsg: '',
    };
  },
  methods: {
    async changePassword() {
      await this.$axios
        .post('changePassword', {
          oldPass: this.oldPass,
          newPass: this.newPass,
          secPass: this.secPass,
        })
        .then(e => {
          this.successStatus = true;
          this.alertStatus = false;
        })
        .catch(e => {
          this.errorMsg = e.response.data.msg;
          this.alertStatus = true;
          this.successStatus = false;
        });
    },
  },
};
</script>
