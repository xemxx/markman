<template>
  <div>
    <el-form
      :model="signUp"
      :rules="signUpRules"
      ref="signUp"
      label-width="100px"
    >
      <el-form-item label="服务器地址" prop="server">
        <el-input
          type="text"
          v-model="signUp.server"
          placeholder="http(s)://127.0.0.1:8000"
        ></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="user">
        <el-input
          type="text"
          v-model="signUp.user"
          placeholder="xem"
        ></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          type="password"
          v-model="signUp.password"
          placeholder="xemxem"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit('signUp')"
          >注册</el-button
        >
        <el-button @click="handleReset('signUp')" style="margin-left: 8px"
          >重置</el-button
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
      signUp: {
        server: '',
        user: '',
        password: ''
      },
      signUpRules: {
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
      let msg = this.$message
      let router = this.$router
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$axios
            .post(this.signUp.server + '/signUp', {
              username: this.signUp.user,
              password: this.signUp.password
            })
            .then(() => {
              msg({
                message: '注册成功!请手动登录:)',
                type: 'success',
                center: true
              })
              router.push('/sign/in')
            })
        } else {
          msg({
            message: '验证错误，请检查输入',
            type: 'warning',
            center: true
          })
        }
      })
    },
    handleReset(name) {
      this.$refs[name].resetFields()
    }
  }
}
</script>
