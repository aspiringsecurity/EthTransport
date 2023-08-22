import { Localstorage } from 'data/storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TransactionPersistState {
  txnQueue: any[];
  setTxnQueue: (txnQueue: any[]) => void;
}

export const useTransactionPersistStore = create(
  persist<TransactionPersistState>(
    (set) => ({
      txnQueue: [],
      setTxnQueue: (txnQueue) => set(() => ({ txnQueue }))
    }),
    { name: Localstorage.TransactionStore }
  )
);
