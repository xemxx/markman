<template>
  <a-form :model="signIn" layout="vertical" :rules="signInRules" ref="signIn">
    <a-form-item label="服务器地址" name="server">
      <a-input
        type="text"
        v-model:value="signIn.server"
        placeholder="http://127.0.0.1:8000"
      ></a-input>
    </a-form-item>
    <a-form-item label="用户名" name="username">
      <a-input type="text" v-model:value="signIn.username"></a-input>
    </a-form-item>
    <a-form-item label="密码" name="password">
      <a-input type="password" v-model:value="signIn.password"></a-input>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="handleSubmit('signIn')">登陆</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  name: 'SignIn',
  data() {
    return {
      signIn: {
        server: '',
        username: '',
        password: '',
      },
      signInRules: {
        server: [
          { required: true, trigger: 'blur' },
          { type: 'url', trigger: 'blur' },
        ],
        username: [{ required: true, trigger: 'blur' }],
        password: [
          { required: true, trigger: 'blur' },
          { min: 6, message: '密码至少6位', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate().then(() => {
        const msg = this.$message
        const { username, password, server } = this.signIn
        const router = this.$router
        const store = this.$store

        // 向服务器发起登录请求
        this.$axios
          .post(this.signIn.server + '/signIn', {
            username,
            password,
          })
          .then(data => {
            // 服务端成功返回数据，更新客户端的活动用户信息
            return store.dispatch('user/setActiver', {
              username,
              token: data.token,
              server,
            })
          })
          .then(() => {
            // 显示消息框提示用户成功
            msg.success('登录成功:)')
            router.push('/editorBase')
          })
        // 如果失败有后台封装的默认处理函数
      })
    },
  },
}
</script>

<style></style>
