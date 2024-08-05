# markman

[![Build Status](https://app.travis-ci.com/xemxx/markman.svg?branch=master)](https://app.travis-ci.com/xemxx/markman)

[![Build status](https://ci.appveyor.com/api/projects/status/necfva92gr7it59q?svg=true)](https://ci.appveyor.com/project/xemxx/markman-client)

## 配置开发环境

```
pnpm i
```

electron builder 搭配pnpm配置

```
# .npmrc
node-linker=hoisted
```

配置完后需要重新启用终端

### 构建原生sqlite3失败处理方法

python3 版本太新，不支持distutils，需要手动安装setuptools

pip3 install setuptools
