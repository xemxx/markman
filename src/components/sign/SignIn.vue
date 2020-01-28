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
      <el-form-item label="用户名" prop="user">
        <el-input
          type="text"
          v-model="signIn.user"
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
  name: 'signin',
  data() {
    return {
      signIn: {
        server: '',
        user: '',
        password: ''
      },
      signInRules: {
        server: [
          { required: true, trigger: 'blur' },
          { type: 'url', trigger: 'blur' }
        ],
        user: [{ required: true, trigger: 'blur' }],
        password: [
          { required: true, trigger: 'blur' },
          { min: 6, message: '密码至少6位', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        let msg = this.$message
        let user = this.signIn
        let router = this.$router
        let store = this.$store
        if (valid) {
          this.$axios
            .post(this.signIn.server + '/signIn', {
              username: this.signIn.user,
              password: this.signIn.password
            })
            .then(data => {
              store
                .dispatch('user/setActiver', { ...user, token: data.token })
                .then(() => {
                  msg({
                    message: '登录成功:)',
                    type: 'success',
                    center: true
                  })
                  router.push('/home')
                })
            })
        } else {
          msg({
            message: '验证错误，请检查输入',
            type: 'warning',
            center: true
          })
        }
      })
    }
  }
}
</script>

<style></style>
