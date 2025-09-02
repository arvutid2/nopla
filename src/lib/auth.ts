// Mock Pi Wallet auth hook
export function useAuth() {
  return {
    isAuthed: true, // pane false kui tahad näha "Sign in with Pi" nuppu
    login: async () => {
      console.log("Mock login called");
    },
    logout: () => {
      console.log("Mock logout called");
    },
  };
}