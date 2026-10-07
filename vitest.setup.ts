import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver

// Node exposes a `localStorage` getter that returns undefined unless
// `--localstorage-file` is provided. Vitest skips populating globals that already
// exist, so jsdom's storage never reaches the test environment. Provide an
// in-memory implementation so hooks/tests relying on Web Storage keep working.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear() {
    this.store.clear()
  }

  getItem(key: string) {
    return this.store.get(String(key)) ?? null
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.store.delete(String(key))
  }

  setItem(key: string, value: string) {
    this.store.set(String(key), String(value))
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
  writable: true,
})

afterEach(() => {
  cleanup()
})
