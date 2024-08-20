# markman

一款简单的markdown云同步笔记，基于vue+vite+electron开发，服务端采用golang开发，依赖数据库mysql

客户端数据保存在本地sqlite3，无加密（性能党，实在没找到合适的js开发的数据库）

主打一个数据私有化，功能够用就行

# 版本须知

0.3.0 之前的需要先升级到0.3.0 然后再继续升级，中间有数据变更，直接使用最新的则可以正常升级

## 配置开发环境

推荐pnpm，省空间，但是有些坑：

### electron builder 搭配pnpm配置

```
# .npmrc
node-linker=hoisted
```

配置完后需要重新启用终端

### 构建原生sqlite3失败处理方法

python3 版本太新，不支持distutils，需要手动安装setuptools

pip3 install setuptools

### sqlite3 版本

需要锁定 5.1.6 5.1.7有坑会导致打包失败
