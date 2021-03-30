<template>
  <a-form :model="signUp" :rules="signUpRules" ref="signUp" label-width="100px">
    <a-form-item label="服务器地址" name="server">
      <a-input
        type="text"
        :value="signUp.server"
        placeholder="http(s)://127.0.0.1:8000"
      ></a-input>
    </a-form-item>
    <a-form-item label="用户名" name="user">
      <a-input
        type="text"
        :value="signUp.user"
        placeholder="xem"
      ></a-input>
    </a-form-item>
    <a-form-item label="密码" name="password">
      <a-input
        type="password"
        :value="signUp.password"
        placeholder="xemxem"
      ></a-input>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="handleSubmit('signUp')">注册</a-button>
      <a-button @click="handleReset('signUp')" style="margin-left: 8px"
        >重置</a-button
      >
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  name: 'SignUp',
  data() {
    return {
      signUp: {
        server: '',
        user: '',
        password: '',
      },
      signUpRules: {
        server: [
          { required: true, trigger: 'blur' },
          { type: 'url', trigger: 'blur' },
        ],
        user: [{ required: true, trigger: 'blur' }],
        password: [
          { required: true, trigger: 'blur' },
          { min: 6, message: '密码至少6位', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    handleSubmit(name) {
      let msg = this.$message
      let router = this.$router
      this.$refs[name]
        .validate()
        .then(() => {
          this.$axios
            .post(this.signUp.server + '/signUp', {
              username: this.signUp.user,
              password: this.signUp.password,
            })
            .then(() => {
              msg.success('注册成功!请手动登录:)')
              router.push('/sign/in')
            })
        })
        .catch()
    },
    handleReset(name) {
      this.$refs[name].resetFields()
    },
  },
}
</script>
