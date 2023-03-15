export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NOTION_API_KEY: string;
      NOTION_DATABASE_ID: string;
    }
  }
}
