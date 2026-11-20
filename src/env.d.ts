/// <reference types="vite/client" />

/** Environment variables read by the app. See .env.example for what each one does. */
interface ImportMetaEnv {
  /** API base including the /mec-api prefix. Defaults to /mec-api. */
  readonly VITE_API_BASE_URL?: string;
  /** Public website URL, used for previews, links and the work library. */
  readonly VITE_API_CUSTOMER_BASE_URL?: string;
  /** This admin app's public URL (build-time only, used in index.html). */
  readonly VITE_ADMIN_URL?: string;
  /** Dev/preview proxy target for /mec-api (vite.config.ts only). */
  readonly VITE_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
