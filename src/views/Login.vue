<template>
  <div class="relative flex min-h-screen overflow-hidden">
    <!-- Decorative Background -->
    <div class="absolute inset-0 noise-bg">
      <!-- Gradient orbs -->
      <div
        class="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-200/40 to-orange-300/30 blur-3xl animate-blur-in"
      />
      <div
        class="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-teal-200/30 to-emerald-300/20 blur-3xl animate-blur-in"
        style="animation-delay: 0.2s"
      />
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-stone-100/50 to-stone-200/30 blur-3xl animate-blur-in"
        style="animation-delay: 0.4s"
      />
    </div>

    <!-- Left Side - Branding -->
    <div class="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
      <div class="animate-fade-in">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 flex items-center justify-center"
          >
            <span class="icon-[lucide--pen-line] text-white text-xl" />
          </div>
          <span class="text-2xl font-semibold tracking-tight text-foreground">Markman</span>
        </div>
      </div>

      <div class="space-y-6 animate-slide-up" style="animation-delay: 0.3s">
        <blockquote class="heading-serif text-3xl leading-relaxed text-foreground/90 text-balance">
          "记录思想的温度，<br />沉淀知识的力量"
        </blockquote>
        <p class="text-muted-foreground text-sm">
          一款优雅的本地 Markdown 笔记应用<br />
          让写作回归纯粹
        </p>
      </div>

      <div class="text-xs text-muted-foreground/60 animate-fade-in" style="animation-delay: 0.5s">
        © 2025 Markman. Crafted with care.
      </div>
    </div>

    <!-- Right Side - Auth Form -->
    <div class="relative w-full lg:w-1/2 flex items-center justify-center p-6">
      <div
        class="w-full max-w-md space-y-8 animate-scale-in"
        style="animation-delay: 0.2s"
      >
        <!-- Mobile Logo -->
        <div class="lg:hidden flex justify-center mb-8">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 flex items-center justify-center"
            >
              <span class="icon-[lucide--pen-line] text-white text-2xl" />
            </div>
            <span class="text-2xl font-semibold tracking-tight">Markman</span>
          </div>
        </div>

        <!-- Auth Card -->
        <div class="glass-card rounded-2xl p-8 shadow-xl">
          <Tabs default-value="login" v-model="selected" class="w-full">
            <TabsList class="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="login"
                class="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
              >
                登录
              </TabsTrigger>
              <TabsTrigger
                value="register"
                class="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
              >
                注册
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" class="mt-0 space-y-6">
              <div class="space-y-2">
                <h1 class="text-2xl font-semibold tracking-tight">欢迎回来</h1>
                <p class="text-sm text-muted-foreground">登录您的账户继续写作</p>
              </div>

              <AutoForm
                class="space-y-4"
                :schema="loginFormSchema"
                :field-config="{
                  username: {
                    inputProps: {
                      class: 'input-elegant h-11',
                      placeholder: '请输入用户名',
                    },
                  },
                  password: {
                    inputProps: {
                      type: 'password',
                      class: 'input-elegant h-11',
                      placeholder: '请输入密码',
                    },
                  },
                }"
                @submit="onSubmit"
              >
                <Button
                  type="submit"
                  class="w-full h-11 btn-warm rounded-xl text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                >
                  <span class="relative z-10 flex items-center gap-2">
                    登录
                    <span class="icon-[lucide--arrow-right] text-sm" />
                  </span>
                </Button>
              </AutoForm>

              <div class="text-center">
                <router-link
                  to="/login-setting"
                  class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors animated-underline"
                >
                  <span class="icon-[lucide--settings] text-xs" />
                  配置服务器地址
                </router-link>
              </div>
            </TabsContent>

            <TabsContent value="register" class="mt-0 space-y-6">
              <div class="space-y-2">
                <h1 class="text-2xl font-semibold tracking-tight">创建账户</h1>
                <p class="text-sm text-muted-foreground">注册以开始您的写作之旅</p>
              </div>

              <AutoForm
                class="space-y-4"
                :schema="registerFormSchema"
                :field-config="{
                  username: {
                    inputProps: {
                      class: 'input-elegant h-11',
                      placeholder: '请输入用户名',
                    },
                  },
                  password: {
                    inputProps: {
                      type: 'password',
                      class: 'input-elegant h-11',
                      placeholder: '设置密码（至少6位）',
                    },
                  },
                  confirm: {
                    inputProps: {
                      type: 'password',
                      class: 'input-elegant h-11',
                      placeholder: '确认密码',
                    },
                  },
                }"
                @submit="onRegister"
              >
                <Button
                  type="submit"
                  class="w-full h-11 btn-warm rounded-xl text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                >
                  <span class="relative z-10 flex items-center gap-2">
                    创建账户
                    <span class="icon-[lucide--user-plus] text-sm" />
                  </span>
                </Button>
              </AutoForm>

              <div class="text-center">
                <router-link
                  to="/login-setting"
                  class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors animated-underline"
                >
                  <span class="icon-[lucide--settings] text-xs" />
                  配置服务器地址
                </router-link>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <!-- Features -->
        <div class="grid grid-cols-3 gap-4 px-2">
          <div class="text-center space-y-1 animate-fade-in" style="animation-delay: 0.4s">
            <div
              class="w-10 h-10 mx-auto rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-2"
            >
              <span class="icon-[lucide--lock] text-teal-600 dark:text-teal-400" />
            </div>
            <p class="text-xs text-muted-foreground">本地存储</p>
          </div>
          <div class="text-center space-y-1 animate-fade-in" style="animation-delay: 0.5s">
            <div
              class="w-10 h-10 mx-auto rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2"
            >
              <span class="icon-[lucide--cloud-sync] text-amber-600 dark:text-amber-400" />
            </div>
            <p class="text-xs text-muted-foreground">云端同步</p>
          </div>
          <div class="text-center space-y-1 animate-fade-in" style="animation-delay: 0.6s">
            <div
              class="w-10 h-10 mx-auto rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-2"
            >
              <span class="icon-[lucide--sparkles] text-rose-600 dark:text-rose-400" />
            </div>
            <p class="text-xs text-muted-foreground">优雅体验</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
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
      required_error: '请输入密码',
    })
    .min(6, {
      message: '密码至少6位',
    })
    .describe('密码'),
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
      return user.setCurrentUser({
        username,
        token: res.token,
        uuid: res.uuid,
      })
    })
    .then(() => {
      toast({
        title: '欢迎回来 ✨',
        description: '登录成功',
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
        required_error: '请输入密码',
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
        title: '注册成功 🎉',
        description: '请使用新账户登录',
      })
      selected.value = 'login'
    })
    .catch(err => {
      console.error(err)
    })
}
</script>

<style scoped>
/* Ensure smooth animations on mount */
.animate-fade-in,
.animate-slide-up,
.animate-scale-in,
.animate-blur-in {
  opacity: 0;
}
</style>
