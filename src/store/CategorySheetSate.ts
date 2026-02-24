import { create } from 'zustand'
type CategoryState = {
  transactionId?: string
  id: string | null | undefined
  isOpen: boolean
  onOpen: (id: string | null | undefined, transactionId?: string) => void
  onClose: () => void
}

export const useCategoryState = create<CategoryState>(set => ({
  transactionId: undefined,
  id: undefined,
  isOpen: false,
  onOpen: (id?: string | null, transactionId?: string) => set({ isOpen: true, id, transactionId }),
  onClose: () => set({ isOpen: false, id: undefined }),
}))
