export const localStorage = {
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value)
      window.localStorage.setItem(key, serialized)
    } catch (error) {
      console.error(`Error saving to localStorage [${key}]:`, error)
    }
  },

  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return defaultValue
      
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error reading from localStorage [${key}]:`, error)
      return defaultValue
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage [${key}]:`, error)
    }
  },

  clear(): void {
    try {
      window.localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },
}
