import { defineStore } from 'pinia'

export const useAgentStore = defineStore('agent', {
  state: () => ({
    isDialogVisible: false
  }),
  
  actions: {
    openDialog() {
      this.isDialogVisible = true
    },
    
    closeDialog() {
      this.isDialogVisible = false
    }
  }
})