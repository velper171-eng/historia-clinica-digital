import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

// Credenciales por defecto (puedes cambiarlas aquí o usar variables de entorno)
const AUTHORIZED_USERS = [
  { user: "39457112", pass: "39457112" },
  { user: "1007346562", pass: "1007346562" }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (user, pass) => {
        const isValid = AUTHORIZED_USERS.some(u => u.user === user && u.pass === pass);
        if (isValid) {
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
