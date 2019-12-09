<template>
  <div>
    <Form ref="signIn" :model="signIn" :rules="signInRules" :label-width="80">
      <FormItem prop="server">
        <Input
          prefix="ios-browsers-outline"
          type="text"
          v-model="signIn.server"
          placeholder="服务器地址：http(s)://example.com:80"
        />
      </FormItem>
      <FormItem prop="user">
        <Input
          prefix="ios-person-outline"
          type="text"
          v-model="signIn.user"
          placeholder="用户名"
        />
      </FormItem>
      <FormItem prop="password">
        <Input
          prefix="ios-lock-outline"
          type="password"
          v-model="signIn.password"
          placeholder="密码"
        />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleSubmit('signIn')">登陆</Button>
      </FormItem>
    </Form>
  </div>
</template>

<script>
export default {
  name: "signin",
  data() {
    return {
      signIn: {
        server: "",
        user: "",
        password: ""
      },
      signInRules: {
        server: [
          {
            required: true,
            trigger: "blur"
          }
        ],
        user: [
          {
            required: true,
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            trigger: "blur"
          },
          {
            type: "string",
            min: 6,
            message: "The password length cannot be less than 6 bits",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        let msg = this.$Message;
        let user = this.signIn;
        let router = this.$router;
        let store = this.$store;
        if (valid) {
          var params = new URLSearchParams();
          params.append("username", this.signIn.user);
          params.append("password", this.signIn.password);
          this.$axios
            .post(this.signIn.server + "/signin", params)
            .then(response => {
              let data = response.data;
              if (data.err == 200) {
                let umodel = store.state.user.model;
                umodel
                  .existUser(user.user, user.server)
                  .then(id => {
                    //修改数据库
                    if (id !== "") {
                      console.log("update");
                      // 设置本地活动用户
                      umodel.updateState(1, id);
                      store.commit("user/update_uid", id);
                    } else {
                      console.log("create");
                      umodel.createUser(
                        user.user,
                        user.server,
                        data.data.token
                      );
                    }
                    //修改state
                    store.commit("user/update_token", data.data.token);
                    store.commit("user/update_username", user.user);
                    store.commit("user/update_server", user.server);
                    msg.success("登录成功:)");
                    router.push("/home");
                  })
                  .catch(err => {
                    console.log(err);
                  });
              } else {
                //打印服务端提供的错误信息
                msg.error(data.msg);
              }
            })
            .catch(error => {
              if (error.response) {
                if (error.response.status == 404) {
                  msg.error("服务器地址错误");
                }
              } else {
                console.log(error);
                msg.error("服务器无响应");
              }
            });
        } else {
          this.$Message.error("验证错误!");
        }
      });
    }
  }
};
</script>

<style></style>
