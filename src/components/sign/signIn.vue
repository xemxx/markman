<template>
  <a-form
    ref="signInRef"
    :model="signIn"
    layout="vertical"
    :rules="signInRules"
  >
    <a-form-item label="服务器地址" name="server">
      <a-input
        v-model:value="signIn.server"
        type="text"
        placeholder="http://127.0.0.1:8000"
      ></a-input>
    </a-form-item>
    <a-form-item label="用户名" name="username">
      <a-input v-model:value="signIn.username" type="text"></a-input>
    </a-form-item>
    <a-form-item label="密码" name="password">
      <a-input
        v-model:value="signIn.password"
        type="password"
        @keyup.enter="handleSubmit()"
      ></a-input>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="handleSubmit()">登陆</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from '@/router'
import { useUserStore } from '@/store/user'
import axios from '@/plugins/axios'
const signIn = ref({
  server: '',
  username: '',
  password: '',
})
const signInRules = {
  server: [
    { required: true, trigger: 'blur' },
    { type: 'url', trigger: 'blur' },
  ],
  username: [{ required: true, trigger: 'blur' }],
  password: [
    { required: true, trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
}

const router = useRouter()
const user = useUserStore()
const signInRef = ref()

const handleSubmit = () => {
  const msg = message
  const { username, password, server } = signIn.value

  signInRef.value
    .validate()
    .then(async () => {
      // 向服务器发起登录请求
      const data: { token: any } = await axios.post(server + '/signIn', {
        username,
        password,
      })
      await user.setActiver({
        username,
        token: data.token,
        server,
      })
      // 显示消息框提示用户成功
      msg.success('登录成功:)')
      return router.push('/editorBase')
      // 如果失败有后台封装的默认处理函数
    })
    .catch(() => {})
}
</script>

<style></style>
