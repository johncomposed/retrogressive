import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths';
// import firebasePlugin from 'vite-plugin-firebase'; // has annoying peer deps issues when using npm. To use I should swap to yarn or pnpm.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    // firebasePlugin({
    //   projectId: 'retrogressive-1',
    //   projectName: 'retrogressive-1',
    //   targets: ["auth", "functions", "firestore", "database", "hosting"],
    //   showUI: true
    // })
  ]
})
