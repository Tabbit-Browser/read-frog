import process from 'node:process'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  imports: false,
  modules: ['@wxt-dev/module-react', '@wxt-dev/i18n/module'],
  manifestVersion: 3,
  // WXT top level alias - will be automatically synced to tsconfig.json paths and Vite alias
  alias: {},
  manifest: ({ mode, browser }) => ({
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    // Fixed extension ID for development
    ...(mode === 'development' && (browser === 'chrome' || browser === 'edge') && {
      key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw2KhiXO2vySZtPu5pNSbyKhYavh8Be7gXmCZt8aJf6tQ/L3JK0qzL+3JSc/o20td3Jw+B2Dcw+EI93NAZr24xKnTNXQiJpuIuHb8xLXD0Ra/HrTVi4TJIhPdESogoG4uL6CD/F3TxfZJ2trX4Bt9cdAw1RGGeU+xU0g+YFfEka4ZUCpFAmTEw9H3/DU+nCp8yGaJWyiVgCTcFe38GZKEPt0iMJkTw956wz/iiafLx0pNG/RaztG9cAPoQOD2+SMFaeQ+b/G4OG17TYhzb09AhNBl6zSJ3jTKHSwuedCFwCce8Q/EchJfQZv71mjAE97bzwvkDYPCLj31Z5FE8HntMwIDAQAB',
    }),
    permissions: ['storage', 'tabs', 'tabInstance', 'tabThemeColor', 'alarms', 'cookies', 'contextMenus', 'scripting', 'webNavigation'],
    host_permissions: [
      '*://*/*', // Required for scripting.executeScript in any frame
    ],
  }),
  dev: {
    server: {
      port: 3333,
    },
  },
  vite: configEnv => ({
    optimizeDeps: {
      include: ['@radix-ui/react-collapsible'],
    },
    plugins: configEnv.mode === 'production'
      ? [
          {
            name: 'check-api-key-env',
            buildStart() {
              const apiKeyVars = Object.keys(process.env)
                .filter(key => /^WXT_.*API_KEY/.test(key))

              if (apiKeyVars.length > 0) {
                throw new Error(
                  `\n\nFound WXT_*_API_KEY environment variables that may be bundled:\n`
                  + `${apiKeyVars.map(k => `   - ${k}`).join('\n')}\n\n`
                  + `Please unset these variables before building for production.\n`,
                )
              }
            },
          },
        ]
      : [],
  }),
})
