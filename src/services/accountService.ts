import axios from 'axios'
import { authService } from './authService'

const API_URL = 'http://localhost:3000/v1'

axios.interceptors.request.use((config) => {
  const token = authService.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers.Accept = 'application/json'
  return config
})

export interface BankAccount {
  id: number
  bank_name?: string
  bank_code?: string
  agency_number?: string
  agency_digit?: string
  number: string
  account_number: string
  account_digit: string
  account_type?: string
  document?: string
  holder_name: string
  created_at: string
  updated_at: string
  balance: number
  amount: number
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface Transfer {
  id: number
  amount_to_transfer: number
  transfer_type: number // 1 = PIX, 2 = TED
  created_at: string
  source_account?: BankAccount
  destination_account?: BankAccount
}

export interface TransferData {
  bank_account_transfer: {
    to_user_bank_account_id: number
    from_user_bank_account_id: number
    transfer_type: number
    amount_to_transfer: number
  }
  make_success?: boolean
}

export interface TransferFilters {
  start_date?: string
  end_date?: string
  min_value?: number
  max_value?: number
  transfer_type?: 'sent' | 'received'
  page?: number
  per_page?: number
}

export const accountService = {
  async getMyAccounts(): Promise<{ user_bank_accounts: BankAccount[] }> {
    console.log('Chamando getMyAccounts');
    try {
      const response = await axios.get(`${API_URL}/users/bank_accounts/my`);
      console.log('Resposta bruta getMyAccounts:', response);
      return response.data;
    } catch (error) {
      console.error('Erro em getMyAccounts:', error);
      throw error;
    }
  },

  async getAvailableAccounts(): Promise<{ user_bank_accounts: BankAccount[] }> {
    try {
      const response = await axios.get(`${API_URL}/users/bank_accounts`);
      console.log('Resposta bruta getAvailableAccounts:', response);
      return response.data;
    } catch (error) {
      console.error('Erro em getAvailableAccounts:', error);
      throw error;
    }
  },

  async getTransactions(filters?: TransferFilters): Promise<{
    data: {
      bank_account_transfers: Transfer[]
      total_records: number
      total_pages: number
      current_page: number
    }
  }> {
    try {
      const response = await axios.get(`${API_URL}/users/bank_account_transfers/statements`, {
        params: filters
      });
      console.log('Resposta bruta getTransactions:', response);
      return response.data;
    } catch (error) {
      console.error('Erro em getTransactions:', error);
      throw error;
    }
  },

  async transfer(data: TransferData): Promise<Transfer> {
    try {
      const response = await axios.post(`${API_URL}/users/bank_account_transfers`, data);
      console.log('Resposta bruta transfer:', response);
      return response.data;
    } catch (error) {
      console.error('Erro em transfer:', error);
      throw error;
    }
  }
} 