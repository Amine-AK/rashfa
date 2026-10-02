/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL?: string;
  readonly VITE_POSTGRES_URL?: string;
  readonly VITE_POSTGRES_URL_NON_POOLING?: string;
  readonly POSTGRES_URL?: string;
  readonly POSTGRES_URL_NON_POOLING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
