# markman

## 配置开发环境

``` 
npm install
npm run installsql
```

## 建议的配置`~/.npmrc`

1. 解决electron问题：
```
home=https://npm.taobao.org
electron_mirror=https://cdn.npm.taobao.org/dist/electron/
electron_custom_dir=7.1.10
registry=https://registry.npm.taobao.org/
```

2. 解决sqlite问题：

- 如果是卡在install 挂vpn或者用cnpm

- 如果是卡在installsql 挂vpn


## 运行

``` 
npm run electron:serve
```


