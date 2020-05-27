<template>
    <div>
        <el-button type='info' @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
    methods: {
        logout() {
            window.sessionStorage.clear()
            this.$router.push('/login')
            // window.vue = this
            // console.log(window.vue);
            
        }
    }
}
</script>

<style lang="less" scoped>

</style>