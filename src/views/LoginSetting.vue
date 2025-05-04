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
        <div class="space-y-6">
          <div class="space-y-2">
            <Label for="server">服务器地址</Label>
            <Input
              id="server"
              v-model="serverInput"
              placeholder="请输入服务器地址"
              type="url"
            />

            <!-- 历史记录列表 -->
            <div v-if="serverHistory.length > 0" class="mt-2 rounded-md border">
              <div class="flex items-center justify-between border-b p-2">
                <span class="text-xs font-medium text-muted-foreground"
                  >历史记录</span
                >
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-6 text-xs"
                  @click="clearHistory"
                >
                  清空
                </Button>
              </div>
              <div class="max-h-[200px] overflow-y-auto">
                <div
                  v-for="(server, index) in serverHistory"
                  :key="index"
                  class="flex cursor-pointer items-center justify-between border-b p-2 text-sm last:border-b-0 hover:bg-accent hover:text-accent-foreground"
                  @click="selectServer(server)"
                >
                  <span class="truncate">{{ server }}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6"
                    @click.stop="removeServer(server)"
                  >
                    <span class="icon-[lucide--x] size-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p v-if="serverError" class="text-sm text-destructive">
              {{ serverError }}
            </p>
          </div>
          <Button
            class="flex w-full justify-center"
            type="submit"
            @click="onSubmit"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="icon-[lucide--loader-2] mr-2 size-4 animate-spin"
            />
            下一步
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import http from '@/plugins/axios'
import { useRouter } from '@/router'
import { useUserStore } from '@/store'
import {
  getServerHistory,
  addServerToHistory,
  removeServerFromHistory,
  clearServerHistory,
} from '@/tools/serverHistory'

const user = useUserStore()
const router = useRouter()

// 状态管理
const serverInput = ref(user.server || '')
const serverError = ref('')
const isSubmitting = ref(false)
const serverHistory = ref<string[]>([])

// 加载服务器历史记录
onMounted(() => {
  serverHistory.value = getServerHistory()
})

// 选择服务器
function selectServer(server: string) {
  serverInput.value = server
}

// 移除服务器记录
function removeServer(server: string) {
  removeServerFromHistory(server)
  serverHistory.value = getServerHistory()
}

// 清空历史记录
function clearHistory() {
  clearServerHistory()
  serverHistory.value = []
}

// 验证URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// 提交表单
async function onSubmit() {
  // 重置错误状态
  serverError.value = ''

  // 验证输入
  if (!serverInput.value) {
    serverError.value = '请输入服务器地址'
    return
  }

  if (!isValidUrl(serverInput.value)) {
    serverError.value = '请输入正确的URL地址'
    return
  }

  // 设置提交状态
  isSubmitting.value = true

  try {
    // 连接服务器
    const res = await http.get<{ ok: boolean }, any>(
      serverInput.value + '/ping',
    )

    if (res) {
      // 保存服务器地址
      user.updateServerAddr(serverInput.value)

      // 添加到历史记录
      addServerToHistory(serverInput.value)

      // 提示成功
      toast({
        title: '服务器地址验证成功',
      })

      // 跳转到登录页
      router.push('/login')
    } else {
      serverError.value = '服务器健康检查失败，建议检查网络或者服务部署情况'
      toast({
        title: '服务器健康检查失败',
        description: '建议检查网络或者服务部署情况',
        variant: 'destructive',
      })
    }
  } catch (err) {
    console.error(err)
    serverError.value = '连接服务器失败，请检查网络或服务器地址'
    toast({
      title: '连接服务器失败',
      description: '请检查网络或服务器地址',
      variant: 'destructive',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style></style>
