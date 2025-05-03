<template>
  <div ref="triggerRef" @contextmenu.prevent="onContextMenu" class="contents">
    <slot></slot>
  </div>
  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="menuRef"
      class="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
      @click.stop
    >
      <slot name="content"></slot>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, provide } from 'vue'

// 触发元素引用
const triggerRef = ref<HTMLElement | null>(null)
// 菜单元素引用
const menuRef = ref<HTMLElement | null>(null)
// 菜单是否打开
const isOpen = ref(false)
// 菜单位置
const position = ref({ x: 0, y: 0 })

// 处理右键点击事件
const onContextMenu = (event: MouseEvent) => {
  // 阻止默认右键菜单
  event.preventDefault()

  // 设置菜单位置
  position.value = calculatePosition(event.clientX, event.clientY)

  // 显示菜单
  isOpen.value = true

  // 下一帧添加点击外部监听
  nextTick(() => {
    document.addEventListener('mousedown', handleClickOutside)
    // 添加按键监听，按 Esc 关闭菜单
    document.addEventListener('keydown', handleKeyDown)
  })
}

// 关闭菜单
const closeMenu = () => {
  isOpen.value = false
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
}

// 提供关闭菜单方法给子组件
provide('closeContextMenu', closeMenu)

// 处理点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (
    isOpen.value &&
    menuRef.value &&
    !menuRef.value.contains(event.target as Node)
  ) {
    closeMenu()
  }
}

// 处理按键事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeMenu()
  }
}

// 计算菜单位置，确保不超出视口
const calculatePosition = (x: number, y: number) => {
  const menuWidth = 160 // 预估菜单宽度
  const menuHeight = 150 // 预估菜单高度

  // 获取视口大小
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 调整 X 坐标，确保菜单不超出右边界
  let adjustedX = x
  if (x + menuWidth > viewportWidth) {
    adjustedX = viewportWidth - menuWidth - 5
  }

  // 调整 Y 坐标，确保菜单不超出底部边界
  let adjustedY = y
  if (y + menuHeight > viewportHeight) {
    adjustedY = viewportHeight - menuHeight - 5
  }

  return { x: adjustedX, y: adjustedY }
}

// 组件卸载时清理事件监听器
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.contents {
  display: contents;
}
</style>
