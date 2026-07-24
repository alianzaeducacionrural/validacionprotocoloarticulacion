import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El sitio se publica en GitHub Pages bajo el nombre del repositorio,
// así que todos los assets cuelgan de esa ruta base.
export default defineConfig({
  plugins: [react()],
  // Debe coincidir EXACTO con el nombre del repositorio en GitHub
  // (alianzaeducacionrural/validacionprotocoloarticulacion), sin guiones.
  base: '/validacionprotocoloarticulacion/',
})
