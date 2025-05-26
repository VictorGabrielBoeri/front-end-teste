<template>
  <v-row class="login-root" no-gutters>
    <v-col cols="12" md="6" class="d-flex align-center justify-center left-col">
      <div class="login-card">
        <div class="login-form-wrapper">
          <h1 class="login-title">
            {{ isLogin ? "Log in to your account." : "Create new account." }}
          </h1>
          <v-form @submit.prevent="handleSubmit" ref="form">
            <v-row v-if="!isLogin" class="name-row" no-gutters>
              <v-col cols="6" class="pr-1">
                <v-text-field
                  v-model="name"
                  label="Names"
                  variant="solo"
                  rounded
                  density="comfortable"
                  prepend-inner-icon="mdi-account-outline"
                  class="login-input"
                  :rules="[rules.required]" />
              </v-col>
              <v-col cols="6" class="pl-1">
                <v-text-field
                  v-model="surname"
                  label="Surnames"
                  variant="solo"
                  rounded
                  density="comfortable"
                  prepend-inner-icon="mdi-account-outline"
                  class="login-input"
                  :rules="[rules.required]" />
              </v-col>
            </v-row>
            <v-text-field
              v-model="email"
              label="Email"
              variant="solo"
              rounded
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
              class="login-input"
              :rules="[rules.required, rules.email]" />
            <v-text-field
              v-model="password"
              label="Password"
              variant="solo"
              rounded
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :type="showPassword ? 'text' : 'password'"
              @click:append-inner="showPassword = !showPassword"
              class="login-input"
              :rules="[rules.required]" />
            <div v-if="isLogin" class="forgot-row">
              <a href="#" class="forgot-link">Forgot your password?</a>
            </div>
            <v-btn
              color="primary"
              class="login-btn"
              size="large"
              rounded
              block
              @click="handleSubmit"
              :loading="loading"
              :disabled="loading">
              {{ isLogin ? "Login" : "Create account" }}
            </v-btn>
          </v-form>
          <div v-if="isLogin" class="divider-text">Or login with</div>
          <div v-if="isLogin" class="social-row">
            <v-btn icon variant="text" class="social-btn"
              ><v-icon size="28">mdi-google</v-icon></v-btn
            >
            <v-btn icon variant="text" class="social-btn"
              ><v-icon size="28">mdi-facebook</v-icon></v-btn
            >
            <v-btn icon variant="text" class="social-btn"
              ><v-icon size="28">mdi-apple</v-icon></v-btn
            >
          </div>
          <div class="signup-row">
            <span v-if="isLogin">Don't have an account?</span>
            <span v-else>Already have an account?</span>
            <a
              href="#"
              class="signup-link"
              @click.prevent="isLogin = !isLogin"
              >{{ isLogin ? "Create Account" : "Log in" }}</a
            >
          </div>
        </div>
      </div>
    </v-col>

    <v-col cols="6" class="hidden-sm-and-down right-col">
      <div class="image-bg">
        <div class="image-mask"></div>
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
          alt="login bg" />
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../services/authService";
import { useSnackbar } from "../composables/useSnackbar";

const router = useRouter();
const { showSuccess, showError } = useSnackbar();

const isLogin = ref(true);
const name = ref("");
const surname = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const form = ref();
const showPassword = ref(false);

const rules = {
  required: (v: string) => !!v || "Campo obrigatório",
  email: (v: string) => /.+@.+\..+/.test(v) || "Email inválido",
};

const handleSubmit = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  try {
    loading.value = true;
    if (isLogin.value) {
      await authService.login({
        user: {
          email: email.value,
          password: password.value,
        },
      });
      showSuccess("Login realizado com sucesso!");
      window.location.href = "/dashboard";
    } else {
      await authService.signUp({
        user: {
          name: `${name.value} ${surname.value}`.trim(),
          email: email.value,
          password: password.value,
        },
      });
      showSuccess("Cadastro realizado com sucesso!");
      isLogin.value = true;
    }
  } catch (error: any) {
    showError(error.response?.data?.message || "Erro ao processar requisição");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-root {
  min-height: 100vh;
  background: #fff;
}
.left-col {
  background: #fff;
}
.login-card {
  background: #fff;
  border-radius: 48px 0 48px 0;
  box-shadow: 0 4px 32px #00000010;
  max-width: 480px;
  width: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
}
.login-form-wrapper {
  width: 100%;
  max-width: 370px;
  margin: 0 auto;
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.login-title {
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: #111;
  text-align: center;
}
.login-input {
  margin-bottom: 18px;
  background: #f5f7fa;
}
.name-row {
  margin-bottom: 0px;
}
.forgot-row {
  text-align: right;
  margin-bottom: 18px;
}
.forgot-link {
  color: #8a8fa3;
  font-size: 0.95rem;
  text-decoration: none;
}
.login-btn {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 24px;
  background: #2196f3 !important;
  color: #fff !important;
  box-shadow: 0 2px 8px #2196f340;
}
.divider-text {
  text-align: center;
  color: #8a8fa3;
  margin-bottom: 12px;
  font-size: 1rem;
}
.social-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}
.social-btn {
  background: #f5f7fa !important;
  border-radius: 50%;
  box-shadow: none;
}
.signup-row {
  text-align: center;
  color: #8a8fa3;
  font-size: 1rem;
}
.signup-link {
  color: #2196f3;
  margin-left: 4px;
  text-decoration: underline;
  cursor: pointer;
}
.right-col {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #eaf6ff;
  display: flex;
  align-items: stretch;
}
.image-bg {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-bg img {
  width: 100%;
  height: 100vh;
  object-fit: cover;
  object-position: center;
  border-radius: 0 0 0 0;
  z-index: 1;
}
.image-mask {
  position: absolute;
  left: -60px;
  top: -20px;
  width: 120px;
  height: 130%;
  background: #fff;
  border-top-right-radius: 120px 80px;
  border-bottom-right-radius: 120px 80px;
  z-index: 2;
}
@media (max-width: 960px) {
  .right-col {
    display: none !important;
  }
  .left-col {
    flex: 1 1 100%;
  }
  .login-card {
    border-radius: 32px;
    margin: 24px 0;
    min-height: 400px;
  }
}
</style>
