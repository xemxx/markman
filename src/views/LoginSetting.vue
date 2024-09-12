<template>
  <div
    class="flex h-screen min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8"
  >
    <Card class="mt-12 sm:mx-auto sm:w-full sm:max-w-sm">
      <CardHeader>
        <CardTitle>自定义服务器地址</CardTitle>
        <CardDescription>将保存到本地，修改后需要重新登录</CardDescription>
      </CardHeader>
      <CardContent>
        <AutoForm class="space-y-6" :schema="formSchema" @submit="onSubmit">
          <Button
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            type="submit"
            >下一步</Button
          >
        </AutoForm>
      </CardContent>
    </Card>
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
import { AutoForm } from '@/components/ui/auto-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import http from '@/plugins/axios'
import { useRouter } from '@/router'
import { useUserStore } from '@/store'
const user = useUserStore()

const formSchema = z.object({
  server: z
    .string({
      required_error: 'server is required.',
    })
    .url({
      message: '请输入正确的url',
    })
    .describe('服务器地址')
    .default(user.server ? user.server : ''),
})

function onSubmit(values: Record<string, any>) {
  const router = useRouter()
  const { server } = values
  http
    .get<{ ok: boolean }, any>(server + '/ping')
    .then(res => {
      if (res) {
        user.update_server(server)
        toast({
          title: '服务器地址验证成功',
        })
        router.push('/login')
      } else {
        toast({
          title: '服务器健康检查失败，建议检查网络或者服务部署情况',
        })
      }
    })
    .catch(err => {
      console.error(err)
    })
}
</script>

<style></style>
