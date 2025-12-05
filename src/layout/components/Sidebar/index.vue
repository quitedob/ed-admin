<template>
  <el-aside>
    <div class="menu-side">
      <div class="menu-main">
        <el-menu :default-active="showMenuId" mode="vertical">
          <div v-for="item in menuList" :key="item.id" class="menu-main-item" :class="[item.id === showMenuId ? 'active' : '']">
            <router-link :to="item.path" @click="handleMenu(item)">
              <el-menu-item :key="item.id" :class="[item.id === showMenuId ? 'is-active' : '']" :index="item.path">
                <icon :name="item.menuIcon" class="menu-icon" />
                {{ item.menuName }}
              </el-menu-item>
            </router-link>
          </div>
        </el-menu>
      </div>
    </div>
  </el-aside>
</template>
<script setup>
  import { computed, onMounted } from 'vue'
  import { useUserStore } from '@/store/modules/user'
  import { useRoute } from 'vue-router'
  import router from '@/router'

  // 加载用户菜单
  const menuList = computed(() => useUserStore().getMenuList)

  // 当前路由
  const route = useRoute()

  // 当前激活的菜单ID
  const showMenuId = computed(() => {
    const currentPath = route.path

    // 通过路径匹配菜单
    const currentMenu = menuList.value.find(menu => {
      if (menu.children && menu.children.length > 0) {
        // 检查当前路径是否匹配任何子菜单
        return menu.children.some(child => child.path === currentPath)
      }
      // 检查主菜单路径是否匹配
      return menu.path === currentPath
    })

    if (currentMenu) {
      return currentMenu.id.toString()
    }

    // 如果没有找到，尝试模糊匹配（比如 /aigc/works 匹配 /aigc 菜单）
    const fuzzyMenu = menuList.value.find(menu => {
      if (menu.children && menu.children.length > 0) {
        return currentPath.startsWith(menu.path + '/')
      }
      return currentPath.startsWith(menu.path + '/')
    })

    if (fuzzyMenu) {
      return fuzzyMenu.id.toString()
    }

    return ''
  })

  // 点击菜单
  function handleMenu(menu) {
    if (menu.children && menu.children.length > 0) {
      // 如果有子菜单，导航到第一个子菜单
      router.push({ path: menu.children[0].path })
    } else if (menu.path) {
      // 如果没有子菜单但有自己的路径，直接导航到菜单路径
      router.push({ path: menu.path })
    }
  }

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> layout/components/Sidebar/index.vue`);
  });

</script>

<style lang="scss" scoped>
  .el-aside {
    overflow: hidden;
    width: 100px;
    transition: all 0.3s;
  }

  .menu-side {
    position: fixed;
    top: 60px;
    width: 100px;
  }

  .menu-main {
    .menu-icon {
      margin-right: 6px;
      width: 20px;
      height: 20px;
    }

    .el-menu {
      background-color: var(--color-primary-900);
      border: 0;
    }

    height: calc(100vh - 50px);
    background-color: var(--color-primary-900);
    padding-left: 10px;

    .menu-main-item {
      margin: 5px 0;

      .el-menu-item {
        width: 90px;
        height: 50px;
        margin: 5px 0;
        color: var(--color-text-inverse);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 12px;
        padding: 8px 5px;
        transition: var(--transition);

        &:hover {
          background-color: var(--color-primary-700);
          color: var(--color-text-inverse);
        }

        &.is-active {
          background: var(--gradient-primary);
          color: var(--color-text-inverse);
          box-shadow: 0 4px 12px var(--color-shadow-primary);
        }
      }

      &.active {
        .el-menu-item {
          background: var(--gradient-primary);
          color: var(--color-text-inverse);
          box-shadow: 0 4px 12px var(--color-shadow-primary);
        }
      }
    }
  }

  .is-active {
    color: var(--color-text-inverse);
  }
</style>
