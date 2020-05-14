# markman

## 配置开发环境

```
npm install
```

## 建议的配置`~/.npmrc`

1. 解决 electron 问题：

```
electron_mirror=https://cdn.npm.taobao.org/dist/electron/
```

2. 解决 sqlite 问题：

```
node-sqlite3_binary_host_mirror=https://npm.taobao.org/mirrors/
```

并且保持 nodejs 版本不高于 13.3.0，sqlite 没有与高版本 nodejs 匹配的包

3. 解决 chromedriver 下载问题

```
chromedriver_cdnurl=https://cdn.npm.taobao.org/dist/chromedriver/
```

4. 淘宝源

```
home=https://npm.taobao.org
registry=https://registry.npm.taobao.org/
```

或者直接通过 nrm 修改源

## 运行

```
npm run electron:serve
```
