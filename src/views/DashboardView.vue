<template>
  <div :class="['dashboard-root', { 'dark-mode': isDarkMode }]">
    <div class="dashboard-main">
      <div class="welcome-card">
        <div class="welcome-left">
          <div class="welcome-title">Olá, {{ account?.holder_name || 'Usuário' }}! :)</div>
          <div class="welcome-date">{{ today }}</div>
        </div>
        <div class="welcome-balance">
          <div class="balance-label">Saldo</div>
          <div class="balance-value">R$ {{ (account?.amount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</div>
          <div class="balance-account">Conta Corrente<br><span class="account-number">{{ maskedAccountNumber }}</span></div>
        </div>
        <div class="welcome-img">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Piggy" />
        </div>
      </div>
      <div class="summary-cards-row">
        <div class="summary-card received">
          <div class="summary-label">Total Recebido</div>
          <div class="summary-value">R$ {{ totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</div>
        </div>
        <div class="summary-card sent">
          <div class="summary-label">Total Enviado</div>
          <div class="summary-value">R$ {{ totalSent.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</div>
        </div>
      </div>
      <div class="dashboard-chart-card">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>
    <div class="dashboard-extract">
      <div class="extract-card">
        <div class="extract-title">Extrato</div>
        <div v-if="!transfers || !Array.isArray(transfers) || transfers.length === 0" class="extract-empty">Nenhuma transação recente</div>
        <div v-else>
          <div v-for="transfer in transfers" :key="transfer.id" class="extract-item">
            <div class="extract-date">{{ new Date(transfer.created_at).toLocaleDateString() }}</div>
            <div class="extract-desc">
              <v-chip :color="formatTransferTypeColor(transfer['transfer_type_text'] ?? transfer.transfer_type)" dark size="small">
                {{ formatTransferType(transfer['transfer_type_text'] ?? transfer.transfer_type) }}
              </v-chip>
            </div>
            <div :class="['extract-value', isSent(transfer) ? 'negative' : 'positive']">
              {{ isSent(transfer) ? '-' : '+' }}R$ {{ transfer.amount_to_transfer.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { accountService, type BankAccount, type Transfer } from '../services/accountService'
import { useSnackbar } from '../composables/useSnackbar'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const { showError } = useSnackbar()
const account = ref<BankAccount | null>(null)
const transfers = ref<Transfer[]>([])
const myAccountNumber = ref<string | null>(null)

const today = computed(() => {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
})

const maskedAccountNumber = computed(() => {
  if (!account.value?.account_number) return '---'
  const num = account.value.account_number.replace(/\D/g, '')
  if (num.length <= 5) return num
  return num.slice(0, num.length - 1) + '-' + num.slice(-1)
})

const formatTransferType = (type: any) => {
  if (typeof type === 'string') {
    if (type.toUpperCase() === 'PIX') return 'PIX';
    if (type.toUpperCase() === 'TED') return 'TED';
  }
  if (type === 1) return 'PIX';
  if (type === 2) return 'TED';
  return 'PIX';
}

const formatTransferTypeColor = (type: any) => {
  if (typeof type === 'string') {
    if (type.toUpperCase() === 'PIX') return 'green';
    if (type.toUpperCase() === 'TED') return 'blue';
  }
  if (type === 1) return 'green';
  if (type === 2) return 'blue';
  return 'green';
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const loadData = async () => {
  console.log('Chamando loadData');
  try {
    const [accountsResponse, transfersData] = await Promise.all([
      accountService.getMyAccounts(),
      accountService.getTransactions({ per_page: 10 })
    ])
    console.log('Resposta getMyAccounts bruta:', accountsResponse);
    console.log('Resposta getTransactions bruta:', transfersData);
    console.log('Estrutura completa de transfersData:', JSON.stringify(transfersData));

    const accounts = accountsResponse?.user_bank_accounts || [];
    if (Array.isArray(accounts) && accounts.length > 0) {
      const primaryAccountApi = accounts[0];
      account.value = primaryAccountApi;
      myAccountNumber.value = primaryAccountApi.account_number ?? null;
      console.log('Dados da conta:', {
        id: primaryAccountApi.id,
        balance: primaryAccountApi.balance,
        amount: primaryAccountApi.amount,
        holder_name: primaryAccountApi.holder_name,
        account_number: primaryAccountApi.account_number
      });
      
      console.log('Número da conta:', primaryAccountApi.account_number);
    } else {
      account.value = null;
      myAccountNumber.value = null;
    }

   
    console.log('Propriedades de transfersData:', Object.keys(transfersData));
    if (transfersData.data) {
      console.log('Propriedades de transfersData.data:', Object.keys(transfersData.data));
    }
    
   
    let foundTransfers = [];
    
    if (transfersData.data?.bank_account_transfers && Array.isArray(transfersData.data.bank_account_transfers)) {
      foundTransfers = transfersData.data.bank_account_transfers;
      console.log('Transferências encontradas em data.bank_account_transfers');
    } else if (transfersData.bank_account_transfers && Array.isArray(transfersData.bank_account_transfers)) {
      foundTransfers = transfersData.bank_account_transfers;
      console.log('Transferências encontradas em bank_account_transfers');
    } else if (transfersData.data && Array.isArray(transfersData.data)) {
      foundTransfers = transfersData.data;
      console.log('Transferências encontradas diretamente em data');
    }
    
    transfers.value = foundTransfers.map((item) => ({
      ...item,
      source_account: item.from_user_bank_account,
      destination_account: item.to_bank_account,
      transfer_type: item.transfer_type ?? item.transfer_type_text,
    }));

    console.log('Account populado:', account.value);
    console.log('Transfers populado:', transfers.value);
    console.log('Número de transferências:', transfers.value?.length || 0);
    
   
    transfers.value.forEach((transfer, index) => {
      console.log(`Transferência ${index + 1}: source_account.account_number=${transfer.source_account?.account_number}, minha conta=${myAccountNumber.value}`);
    });

  } catch (error: any) {
    console.error('Erro em loadData:', error);
    showError(error.response?.data?.message || 'Erro ao carregar dados')
  }
}

const isSent = (item: any) => {
  if (!item || !item.source_account || !myAccountNumber.value) return false;
  return item.source_account.account_number === myAccountNumber.value;
};

const isReceived = (item: any) => {
  if (!item || !item.source_account || !myAccountNumber.value) return false;
  return item.source_account.account_number !== myAccountNumber.value;
};

const totalReceived = computed(() => {
  return transfers.value
    .filter(t => t.source_account && t.amount_to_transfer && !isSent(t))
    .reduce((acc, t) => acc + Number(t.amount_to_transfer), 0)
})
const totalSent = computed(() => {
  return transfers.value
    .filter(t => t.source_account && t.amount_to_transfer && isSent(t))
    .reduce((acc, t) => acc + Number(t.amount_to_transfer), 0)
})

const chartData = computed(() => ({
  labels: ['Recebido', 'Enviado'],
  datasets: [
    {
      label: 'Transferências',
      backgroundColor: ['#43a047', '#e53935'],
      data: [totalReceived.value, totalSent.value],
      borderRadius: 8,
      barPercentage: 0.5,
      categoryPercentage: 0.5
    }
  ]
}))
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    x: {
      grid: { color: '#333', display: false },
      ticks: { color: '#888', font: { size: 14 } }
    },
    y: {
      grid: { color: '#333' },
      ticks: { color: '#888', font: { size: 14 } },
      beginAtZero: true
    }
  }
}

onMounted(loadData)
</script>

<style scoped>
.dashboard-root {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  margin-top: 60px;
}
.dashboard-main {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.dashboard-extract {
  flex: 1;
  min-width: 320px;
}
.welcome-card {
  background: linear-gradient(90deg, #7ed957 0%, #4bb543 100%);
  color: #fff;
  border-radius: 18px;
  padding: 32px 32px 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 180px;
  box-shadow: 0 2px 16px #7ed95722;
  position: relative;
  transition: background 0.3s, color 0.3s;
}
.dark-mode .welcome-card {
  background: linear-gradient(90deg, #263e1a 0%, #1a2a13 100%) !important;
  color: #e0ffe0 !important;
  box-shadow: 0 2px 16px #000a !important;
}
.welcome-left {
  flex: 2;
}
.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}
.dark-mode .welcome-title {
  color: #b6ffb6 !important;
}
.welcome-date {
  font-size: 1rem;
  opacity: 0.9;
}
.dark-mode .welcome-date {
  color: #b6ffb6 !important;
  opacity: 0.8;
}
.welcome-balance {
  flex: 1.5;
  text-align: right;
}
.balance-label {
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.9;
}
.dark-mode .balance-label {
  color: #b6ffb6 !important;
}
.balance-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 4px 0 8px 0;
}
.dark-mode .balance-value {
  color: #7ed957 !important;
}
.balance-account {
  font-size: 1rem;
  opacity: 0.9;
}
.dark-mode .balance-account {
  color: #b6ffb6 !important;
}
.account-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}
.dark-mode .account-number {
  color: #7ed957 !important;
}
.welcome-img {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
.welcome-img img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px #0002);
}
.new-transfer-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px #0001;
  padding: 24px 32px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: background 0.3s, color 0.3s;
}
.dark-mode .new-transfer-card {
  background: #232323 !important;
  color: #f5f5f5 !important;
  box-shadow: 0 2px 8px #0008 !important;
}
.new-transfer-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #222;
}
.dark-mode .new-transfer-title {
  color: #b6ffb6 !important;
}
.transfer-placeholder {
  color: #888;
  font-size: 1rem;
  margin-top: 8px;
}
.dark-mode .transfer-placeholder {
  color: #b6ffb6 !important;
  opacity: 0.7;
}
.extract-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px #0001;
  padding: 24px 24px 16px 24px;
  height: 850px;
  max-height: 850px;
  overflow-y: auto;
  transition: background 0.3s, color 0.3s;
}
.dark-mode .extract-card {
  background: #232323 !important;
  color: #f5f5f5 !important;
  box-shadow: 0 2px 8px #0008 !important;
}
.extract-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 16px;
}
.dark-mode .extract-title {
  color: #b6ffb6 !important;
}
.extract-empty {
  color: #888;
  font-size: 1rem;
  text-align: center;
  margin: 32px 0;
}
.dark-mode .extract-empty {
  color: #b6ffb6 !important;
  opacity: 0.7;
}
.extract-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  padding: 10px 0;
  font-size: 1rem;
  transition: background 0.3s, color 0.3s;
}
.dark-mode .extract-item {
  border-bottom: 1px solid #333 !important;
}
.extract-date {
  color: #888;
  font-size: 0.95rem;
  min-width: 90px;
}
.dark-mode .extract-date {
  color: #b6ffb6 !important;
  opacity: 0.7;
}
.extract-desc {
  flex: 1;
  text-align: left;
  color: #222;
  font-weight: 500;
  display: flex;
  align-items: center;
}
.dark-mode .extract-desc {
  color: #b6ffb6 !important;
}
.extract-desc .v-chip {
  font-size: 0.85rem;
  height: 24px;
  min-width: 48px;
  justify-content: center;
}
.extract-value {
  font-weight: 700;
  font-size: 1.1rem;
}
.extract-value.negative {
  color: #e53935;
}
.extract-value.positive {
  color: #43a047;
}
.dark-mode .extract-value.negative {
  color: #ff6b6b !important;
}
.dark-mode .extract-value.positive {
  color: #7ed957 !important;
}
.summary-cards-row {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}
.summary-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0001;
  padding: 20px 28px 16px 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 180px;
  min-height: 80px;
  transition: background 0.3s, color 0.3s;
}
.summary-card .summary-label {
  font-size: 1.1rem;
  color: #888;
  margin-bottom: 6px;
}
.summary-card .summary-value {
  font-size: 1.7rem;
  font-weight: 700;
  color: #43a047;
}
.summary-card.sent .summary-value {
  color: #e53935;
}
.dark-mode .summary-card {
  background: #232323 !important;
  color: #f5f5f5 !important;
  box-shadow: 0 2px 8px #0008 !important;
}
.dark-mode .summary-card .summary-label {
  color: #b6ffb6 !important;
}
.dark-mode .summary-card .summary-value {
  color: #7ed957 !important;
}
.dark-mode .summary-card.sent .summary-value {
  color: #ff6b6b !important;
}
.dashboard-chart-card {
  width: 100%;
  max-width: 900px;
  min-width: 320px;
  margin: 0 auto 24px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0001;
  padding: 32px 32px 24px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  transition: background 0.3s, color 0.3s;
}
.dark-mode .dashboard-chart-card {
  background: #232323 !important;
  color: #f5f5f5 !important;
  box-shadow: 0 2px 8px #0008 !important;
}
.dashboard-chart-card canvas {
  width: 100% !important;
  height: 320px !important;
  max-width: 800px;
}
@media (max-width: 1100px) {
  .dashboard-root {
    flex-direction: column;
    gap: 24px;
  }
  .dashboard-extract {
    min-width: unset;
    width: 100%;
  }
  .dashboard-chart-card {
    min-width: unset;
    padding: 16px 4px;
  }
  .dashboard-chart-card canvas {
    height: 220px !important;
  }
}
</style>