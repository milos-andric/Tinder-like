<template>
  <div>
    <button @click="testclik">TEST</button>
    <button @click="testjobenass">TEST_jobenass</button>
  </div>
</template>

<script>
export default {
  methods: {
    testclik() {
      console.log('PASS');
    },
    testjobenass() {
      console.log('CLICKED');
    },
  },
};
</script>
