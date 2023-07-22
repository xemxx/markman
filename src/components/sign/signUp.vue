<template>
  <a-form
    ref="signUpRef"
    :model="signUp"
    layout="vertical"
    :rules="signUpRules"
  >
    <a-form-item label="服务器地址" name="server">
      <a-input
        v-model:value="signUp.server"
        type="text"
        placeholder="http(s)://127.0.0.1:8000"
      ></a-input>
    </a-form-item>
    <a-form-item label="用户名" name="user">
      <a-input v-model:value="signUp.user" type="text"></a-input>
    </a-form-item>
    <a-form-item label="密码" name="password">
      <a-input v-model:value="signUp.password" type="password"></a-input>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="handleSubmit()">注册</a-button>
      <a-button style="margin-left: 8px" @click="handleReset()">重置</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from '@/router'
import { useUserStore } from '@/store/user'
import axios from '@/plugins/axios'
const router = useRouter()
const signUpRef = ref()
const signUp = ref({
  server: '',
  user: '',
  password: '',
})
const signUpRules = {
  server: [
    { required: true, trigger: 'blur' },
    { type: 'url', trigger: 'blur' },
  ],
  user: [{ required: true, trigger: 'blur' }],
  password: [
    { required: true, trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
}

const handleSubmit = () => {
  signUpRef.value
    .validate()
    .then(async () => {
      await axios.post(signUp.value.server + '/signUp', {
        username: signUp.value.user,
        password: signUp.value.password,
      })
      message.success('注册成功!请手动登录:)')
      return await router.push('/sign/in')
    })
    .catch((err: any) => err)
}
const handleReset = () => {
  signUpRef.value.resetFields()
}
</script>
