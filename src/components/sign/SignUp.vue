<template>
  <div>
    <Form ref="signUp" :model="signUp" :rules="signUpRules" :label-width="80">
      <FormItem prop="server">
        <Input
          prefix="ios-browsers-outline"
          type="text"
          v-model="signUp.server"
          placeholder="服务器地址：http(s)://example.com:80"
        />
      </FormItem>
      <FormItem prop="user">
        <Input
          prefix="ios-person-outline"
          type="text"
          v-model="signUp.user"
          placeholder="用户名"
        />
      </FormItem>
      <FormItem prop="password">
        <Input
          prefix="ios-lock-outline"
          type="password"
          v-model="signUp.password"
          placeholder="密码"
        />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleSubmit('signUp')">注册</Button>
        <Button @click="handleReset('signUp')" style="margin-left: 8px"
          >重置</Button
        >
      </FormItem>
    </Form>
  </div>
</template>

<script>
export default {
  name: "signin",
  data() {
    return {
      signUp: {
        server: "",
        user: "",
        password: ""
      },
      signUpRules: {
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
        let db = this.$db;
        let user = this.signUp;
        let router = this.$router;
        if (valid) {
          var params = new URLSearchParams();
          params.append("username", this.signUp.user);
          params.append("password", this.signUp.password);
          this.$axios
            .post(this.signUp.server + "/signup", params)
            .then(function(response) {
              let data = response.data;
              if (data.err == 200) {
                //成功，保存本地数据
                let sql = "insert into user (server ,username) values (?,?)";
                db.bindAndRun(sql, [[user.server, user.user]]);
                msg.success("注册成功!请手动登陆:)");
                router.push("/sign/in");
              } else {
                //打印服务端提供的错误信息
                msg.error(data.msg);
              }
            })
            .catch(function(error) {
              if (error.response) {
                if (error.response.status == 404) {
                  msg.error("服务器地址错误");
                }
              } else {
                console.log(error);
                msg.error("代码错误");
              }
            });
        } else {
          this.$Message.error("验证错误!");
        }
      });
    },
    handleReset(name) {
      this.$refs[name].resetFields();
    }
  }
};
</script>

<style></style>
