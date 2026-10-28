import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { clearToken } from '../api/tokenStorage';
import '../i18n';

afterEach(() => {
  clearToken();
  vi.unstubAllGlobals();
});
