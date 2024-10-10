<template>
  <div
    class="flex h-screen min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8"
  >
    <Tabs
      default-value="login"
      v-model="selected"
      class="sm:mx-auto sm:w-full sm:max-w-sm"
    >
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="login"> 登录 </TabsTrigger>
        <TabsTrigger value="register"> 注册 </TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>登录</CardTitle>
            <CardDescription>账户密码</CardDescription>
          </CardHeader>
          <CardContent>
            <AutoForm
              class="space-y-6"
              :schema="loginFormSchema"
              :field-config="{
                password: {
                  inputProps: {
                    type: 'password',
                    placeholder: '••••••••',
                  },
                },
              }"
              @submit="onSubmit"
            >
              <Button
                class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                type="submit"
                >登录
              </Button>
              <p class="mt-10 text-center text-sm text-gray-500">
                <router-link
                  to="/login-setting"
                  class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                >
                  配置服务器地址
                </router-link>
              </p>
            </AutoForm>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="register">
        <Card>
          <CardHeader>
            <CardTitle>注册</CardTitle>
            <CardDescription>注册当前配置服务器的唯一账户</CardDescription>
          </CardHeader>
          <CardContent>
            <AutoForm
              class="space-y-6"
              :schema="registerFormSchema"
              :field-config="{
                password: {
                  inputProps: {
                    type: 'password',
                    placeholder: '••••••••',
                  },
                },
                confirm: {
                  inputProps: {
                    type: 'password',
                    placeholder: '••••••••',
                  },
                },
              }"
              @submit="onRegister"
            >
              <Button
                class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                type="submit"
              >
                注册
              </Button>
              <p class="mt-10 text-center text-sm text-gray-500">
                <router-link
                  to="/login-setting"
                  class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                >
                  配置服务器地址
                </router-link>
              </p>
            </AutoForm>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AutoForm } from '@/components/ui/auto-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import http from '@/plugins/axios'
import { useRouter } from '@/router'
import { useUserStore } from '@/store'
import { ref } from 'vue'

const selected = ref('login')
const loginFormSchema = z.object({
  username: z
    .string({
      required_error: '请输入用户名',
    })
    .min(2, {
      message: '用户名至少两位',
    })
    .describe('用户名'),
  password: z
    .string({
      required_error: '请输入密码.',
    })
    .min(6, {
      message: '密码至少6位',
    })
    .describe('密码'), // Will be "Some Value"
})

const router = useRouter()
const user = useUserStore()
function onSubmit(values: Record<string, any>) {
  const { username, password } = values
  http
    .post<{ token: string; uuid: string }, any>(user.server + '/signIn', {
      username,
      password,
    })
    .then(res => {
      console.log(res)
      return user.setCurrentUser({
        username,
        token: res.token,
        uuid: res.uuid,
      })
    })
    .then(() => {
      // 显示消息框提示用户成功
      toast({
        title: '登录成功:)',
      })
      router.push('/editorBase')
    })
    .catch(err => {
      console.error(err)
    })
}

const registerFormSchema = z
  .object({
    username: z
      .string({
        required_error: '请输入用户名',
      })
      .min(2, {
        message: '用户名至少两位',
      })
      .describe('用户名'),
    password: z
      .string({
        required_error: '请输入密码.',
      })
      .min(6, {
        message: '密码至少6位',
      })
      .describe('密码'),
    confirm: z.string().describe('确认密码'),
  })
  .refine(data => data.password === data.confirm, {
    message: '两次密码不一致',
    path: ['confirm'],
  })

function onRegister(values: Record<string, any>) {
  http
    .post(user.server + '/signUp', {
      username: values.username,
      password: values.password,
    })
    .then(() => {
      toast({
        title: '注册成功!请手动登录:)',
      })
      selected.value = 'login'
    })
    .catch(err => {
      console.error(err)
    })
}
</script>

<style></style>
