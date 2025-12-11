jest.mock('@styles/styles.css', () => ({}), { virtual: true });

import '@testing-library/jest-dom';

// УБРАТЬ ЭТОТ КУСОК или закомментировать:
// const localStorageMock = {
//   getItem: jest.fn(),
//   setItem: jest.fn(),
//   removeItem: jest.fn(),
//   clear: jest.fn(),
// };
// 
// Object.defineProperty(window, 'localStorage', {
//   value: localStorageMock,
// });

// Вместо этого использовать реальный localStorage
if (typeof window !== 'undefined') {
  // Создаем простую реализацию localStorage для тестов
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem(key: string) {
        return store[key] || null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

// Остальной код оставить как есть
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

global.Blob = jest.fn();

global.fetch = jest.fn();

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Element.prototype.scrollIntoView = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

HTMLCanvasElement.prototype.getContext = jest.fn();
global.requestAnimationFrame = jest.fn(callback => {
  setTimeout(callback, 0);
  return 0;
});
global.cancelAnimationFrame = jest.fn();