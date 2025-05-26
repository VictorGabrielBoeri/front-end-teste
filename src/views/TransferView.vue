<template>
  <div class="transfer-center-container">
    <v-container class="transfer-center-container">
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title class="text-h5">
              Nova Transferência
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="handleTransfer" ref="form">
                <v-select
                  v-model="selectedAccount"
                  label="Conta de Destino"
                  :items="Array.isArray(availableAccounts) ? availableAccounts : []"
                  :item-title="item => item.account_number + ' - ' + item.holder_name"
                  item-value="id"
                  :rules="[rules.required]"
                  required
                />
                <div class="text-right mb-2">
                  <v-btn variant="text" size="small" color="primary" @click="handleClickAddAccount">
                    + Cadastrar nova conta
                  </v-btn>
                </div>

                <v-select
                  v-model="transferType"
                  label="Tipo de Transferência"
                  :items="[
                    { title: 'PIX', value: 1 },
                    { title: 'TED', value: 2 }
                  ]"
                  item-title="title"
                  item-value="value"
                  :rules="[rules.required]"
                  required
                />

                <v-text-field
                  v-model="amount"
                  label="Valor"
                  type="number"
                  prefix="R$"
                  :rules="[rules.required, rules.minValue]"
                  required
                />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                @click="handleTransfer"
                :loading="loading"
                :disabled="loading"
              >
                Transferir
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Modal de cadastro de conta -->
      <v-dialog v-model="showAddAccount" max-width="400">
        <v-card>
          <v-card-title>Cadastrar nova conta</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleAddAccount" ref="addAccountForm">
              <v-text-field v-model="newAccount.number" label="Número da Conta" required />
              <v-text-field v-model="newAccount.name" label="Nome do Titular" required />
              <v-text-field v-model="newAccount.email" label="Email" required type="email" />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="showAddAccount = false">Cancelar</v-btn>
            <v-btn color="primary" @click="handleAddAccount">Salvar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { accountService, type BankAccount } from '../services/accountService'
import { useSnackbar } from '../composables/useSnackbar'

const router = useRouter()
const { showSuccess, showError } = useSnackbar()

const selectedAccount = ref<number | null>(null)
const transferType = ref<number>(1)
const amount = ref('')
const loading = ref(false)
const form = ref()
const availableAccounts = ref<BankAccount[]>([])
const myAccounts = ref<BankAccount[]>([])

const showAddAccount = ref(false)
const addAccountForm = ref()
const newAccount = ref({ number: '', name: '', email: '' })

const rules = {
  required: (v: any) => !!v || 'Campo obrigatório',
  minValue: (v: string) => Number(v) > 0 || 'Valor deve ser maior que zero'
}

const loadAccounts = async () => {
  try {
    console.log('Iniciando carregamento de contas...');
    const [available, my] = await Promise.all([
      accountService.getAvailableAccounts(),
      accountService.getMyAccounts()
    ])
    console.log('Resposta available:', available);
    console.log('Resposta my:', my);
    
    if (available?.user_bank_accounts) {
      availableAccounts.value = available.user_bank_accounts;
      console.log('Contas disponíveis carregadas:', availableAccounts.value);
    } else {
      console.error('Formato de resposta inválido para contas disponíveis:', available);
      availableAccounts.value = [];
    }

    if (my?.user_bank_accounts) {
      myAccounts.value = my.user_bank_accounts;
      console.log('Minhas contas carregadas:', myAccounts.value);
    } else {
      console.error('Formato de resposta inválido para minhas contas:', my);
      myAccounts.value = [];
    }
  } catch (error: any) {
    console.error('Erro detalhado ao carregar contas:', error);
    showError(error.response?.data?.message || 'Erro ao carregar contas')
  }
}

const handleTransfer = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return
  try {
    console.log('Tipo de transferência selecionado:', transferType.value)
    loading.value = true
    await accountService.transfer({
      bank_account_transfer: {
        to_user_bank_account_id: selectedAccount.value!,
        from_user_bank_account_id: myAccounts.value[0].id,
        transfer_type: transferType.value,
        amount_to_transfer: Number(amount.value)
      },
      make_success: true
    })
    showSuccess('Transferência realizada com sucesso!')
    router.push('/dashboard')
  } catch (error: any) {
    showError(error.response?.data?.message || 'Erro ao realizar transferência')
  } finally {
    loading.value = false
  }
}

const handleAddAccount = async () => {
  if (!newAccount.value.number || !newAccount.value.name || !newAccount.value.email) return
  if (!Array.isArray(availableAccounts.value)) availableAccounts.value = []
  availableAccounts.value.push({
    id: Date.now(),
    number: newAccount.value.number,
    balance: 0,
    holder_name: newAccount.value.name,
    account_number: newAccount.value.number,
    account_digit: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    amount: 0
  })
  showSuccess('Conta cadastrada localmente!')
  showAddAccount.value = false
  newAccount.value = { number: '', name: '', email: '' }
}

const handleClickAddAccount = () => {
  console.log('Botão "Cadastrar nova conta" clicado');
  showAddAccount.value = true;
}

onMounted(loadAccounts)
</script>

<style scoped>
.transfer-center-container {
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafcfb; /* igual ao fundo da sua tela */
}
</style> 