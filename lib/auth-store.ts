import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

// Credenciales por defecto (puedes cambiarlas aquí o usar variables de entorno)
const VALID_USER = "admin";
const VALID_PASS = "isabel2024";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (user, pass) => {
        if (user === VALID_USER && pass === VALID_PASS) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // persiste en localStorage
    }
  )
);
