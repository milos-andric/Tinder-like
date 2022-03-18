<template>
  <div class="mx-auto col-6">
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
  name: 'ActivatePage',
  auth: 'guest',
  data() {
    return {
      successStatus: false,
      alertStatus: false,
      errorMsg: '',
    };
  },
  async mounted() {
    await this.$axios.post('activate', {
      user_id: this.$route.query.user_id,
      code: this.$route.query.code,
    }).then((e) => {
      this.successStatus = true;
      this.alertStatus = false;
    }).catch((e) => {
      this.errorMsg = e.response.data.msg
      this.successStatus = false;
      this.alertStatus = true;
    })
  },
};
</script>
