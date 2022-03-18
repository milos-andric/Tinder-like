<template>
    <div>
        <button @click="testclik">TEST</button>
    </div>
</template>

<script>
export default {
    methods: {
        testclik() {
            console.log("PASS");
        },
    }
}
</script>