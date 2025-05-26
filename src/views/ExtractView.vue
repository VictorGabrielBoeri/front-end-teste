<template>
  <v-container>
    <v-card>
      <v-card-title>Extrato</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="fetchExtract">
          <v-row>
            <v-col cols="12" sm="3">
              <v-text-field
                v-model="filters.start_date"
                label="Data inicial"
                type="date"
                clearable />
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field
                v-model="filters.end_date"
                label="Data final"
                type="date"
                clearable />
            </v-col>
            <v-col cols="12" sm="2">
              <v-text-field
                v-model="filters.min_value"
                label="Valor mínimo"
                type="number"
                clearable />
            </v-col>
            <v-col cols="12" sm="2">
              <v-text-field
                v-model="filters.max_value"
                label="Valor máximo"
                type="number"
                clearable />
            </v-col>
            <v-col cols="12" sm="2">
              <v-btn color="primary" type="submit">Filtrar</v-btn>
            </v-col>
          </v-row>
        </v-form>
        <v-data-table
          :headers="headers"
          :items="extract"
          :items-per-page="filters.per_page"
          :page.sync="filters.page"
          :server-items-length="totalRecords"
          :loading="loading"
          class="mt-2 compact-table"
          density="compact"
          hide-default-footer>
          <template #item.created_at="{ item }">
            {{ new Date(item.created_at).toLocaleDateString() }}
          </template>
          <template #item.transfer_type="{ item }">
            <v-chip :color="formatTransferTypeColor(item.transfer_type)" dark>
              {{ formatTransferType(item.transfer_type) }}
            </v-chip>
          </template>
          <template #item.direction="{ item }">
            <v-chip :color="isSent(item) ? 'red' : 'green'" dark>
              {{ isSent(item) ? "Enviado" : "Recebido" }}
            </v-chip>
          </template>
          <template #item.amount_to_transfer="{ item }">
            <span :class="isSent(item) ? 'text-error' : 'text-success'">
              {{ isSent(item) ? "-" : "+" }}R$
              {{
                item.amount_to_transfer.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })
              }}
            </span>
          </template>
        </v-data-table>
        <v-pagination
          v-model="filters.page"
          :length="totalPages"
          class="mt-4"
          color="primary" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import {
  accountService,
  type Transfer,
  type TransferFilters,
} from "../services/accountService";
import { useSnackbar } from "../composables/useSnackbar";

const { showError } = useSnackbar();

const extract = ref<Transfer[]>([]);
const totalRecords = ref(0);
const totalPages = ref(1);
const loading = ref(false);
const filters = ref<TransferFilters>({
  page: 1,
  per_page: 10,
  start_date: undefined,
  end_date: undefined,
  min_value: undefined,
  max_value: undefined,
  transfer_type: undefined,
});

const headers = [
  { text: "Data", value: "created_at" },
  { text: "Tipo", value: "transfer_type" },
  { text: "Direção", value: "direction" },
  { text: "Valor", value: "amount_to_transfer" },
];

const formatTransferType = (type: any) => {
  if (typeof type === "string") {
    if (type.toUpperCase() === "PIX") return "PIX";
    if (type.toUpperCase() === "TED") return "TED";
  }
  if (type === 1) return "PIX";
  if (type === 2) return "TED";
  return "PIX";
};

const formatTransferTypeColor = (type: any) => {
  if (typeof type === "string") {
    if (type.toUpperCase() === "PIX") return "green";
    if (type.toUpperCase() === "TED") return "blue";
  }
  if (type === 1) return "green";
  if (type === 2) return "blue";
  return "green";
};

const processTransferType = (type: any): number => {
  if (type === undefined || type === null) {
    return 1;
  }

  if (typeof type === "string" && !isNaN(Number(type))) {
    return Number(type);
  }

  if (typeof type === "object" && type !== null) {
    if ("id" in type) return Number(type.id);
    else if ("type" in type) return Number(type.type);
    else if ("value" in type) return Number(type.value);
  }

  if (typeof type === "string") {
    return Number(type);
  }

  return Number(type) || 1;
};

const isSent = (item: any) => {
  if (
    !item ||
    !item.from_user_bank_account ||
    !myAccountId.value ||
    !myAccountNumber.value
  )
    return false;
  return item.from_user_bank_account.account_number === myAccountNumber.value;
};

const isReceived = (item: any) => {
  if (!item || !item.source_account || !myAccountId.value) return false;
  return String(item.source_account.id) !== String(myAccountId.value);
};

const myAccountId = ref<number | null>(null);
const myAccountNumber = ref<string | null>(null);

const fetchExtract = async () => {
  loading.value = true;
  try {
    if (!myAccountId.value || !myAccountNumber.value) {
      const myAccounts = await accountService.getMyAccounts();
      if (myAccounts?.user_bank_accounts?.length > 0) {
        myAccountId.value = myAccounts.user_bank_accounts[0]?.id ?? null;
        myAccountNumber.value =
          myAccounts.user_bank_accounts[0]?.account_number ?? null;
      }
    }
    const response = await accountService.getTransactions(filters.value);
    let foundTransfers = [];
    let totalRecs = 0;
    let totalPgs = 1;
    if (
      response.data?.bank_account_transfers &&
      Array.isArray(response.data.bank_account_transfers)
    ) {
      foundTransfers = response.data.bank_account_transfers;
      totalRecs = response.data.total_records || 0;
      totalPgs = response.data.total_pages || 1;
    } else if (
      response.bank_account_transfers &&
      Array.isArray(response.bank_account_transfers)
    ) {
      foundTransfers = response.bank_account_transfers;
      totalRecs = response.total_records || 0;
      totalPgs = response.total_pages || 1;
    } else if (response.data && Array.isArray(response.data)) {
      foundTransfers = response.data;
      totalRecs = foundTransfers.length;
      totalPgs = Math.ceil(totalRecs / (filters.value.per_page || 10));
    }
    extract.value = foundTransfers.map((item: any) => ({
      ...item,
      source_account: item.from_user_bank_account,
      destination_account: item.to_bank_account,
      transfer_type: item.transfer_type ?? item.transfer_type_text,
    }));
    totalRecords.value = totalRecs;
    totalPages.value = totalPgs;
    console.log("Meu ID:", myAccountId.value);
    extract.value.forEach((item, idx) => {
      console.log(
        `Transf #${idx + 1}: source_account.id=${
          item.source_account?.id
        }, destination_account.id=${item.destination_account?.id}`
      );
    });
  } catch (error: any) {
    showError(error.response?.data?.message || "Erro ao carregar extrato");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchExtract);

watch(
  () => filters.value.page,
  () => {
    fetchExtract();
  }
);
</script>

<style scoped>
.text-success {
  color: #43a047 !important;
  font-weight: 600;
}
.text-error {
  color: #e53935 !important;
  font-weight: 600;
}
.compact-table .v-data-table__td,
.compact-table .v-data-table__th {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  font-size: 0.97rem;
}
.compact-table .v-chip {
  font-size: 0.85rem;
  height: 24px;
  min-width: 48px;
  justify-content: center;
}
.compact-table .text-success,
.compact-table .text-error {
  font-size: 1rem;
}
.v-card {
  padding: 12px 18px !important;
}
.v-card-title {
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  padding-bottom: 8px !important;
}
.v-card-text {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}
</style>
