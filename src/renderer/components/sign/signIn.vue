<template>
  <div>
    <el-form
      :model="signIn"
      :rules="signInRules"
      ref="signIn"
      label-width="100px"
    >
      <el-form-item label="服务器地址" prop="server">
        <el-input
          type="text"
          v-model="signIn.server"
          placeholder="http://127.0.0.1:8000"
        ></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input
          type="text"
          v-model="signIn.username"
          placeholder="xem"
        ></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="signIn.password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit('signIn')"
          >登陆</el-button
        >
      </el-form-item>
    </el-form>
  </div>
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
      this.$refs[name].validate(valid => {
        const msg = this.$message
        const { username, password, server } = this.signIn
        const router = this.$router
        const store = this.$store
        if (valid) {
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
              msg({
                message: '登录成功:)',
                type: 'success',
                center: true,
              })
              router.push('/base')
            })
          // 如果失败有后台封装的默认处理函数
        } else {
          msg({
            message: '验证错误，请检查输入',
            type: 'warning',
            center: true,
          })
        }
      })
    },
  },
}
</script>

<style></style>
