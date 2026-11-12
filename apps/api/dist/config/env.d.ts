import "dotenv/config";
export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    HOST: string;
    LOG_LEVEL: "debug" | "error" | "info" | "warn";
    DATABASE_URL: string;
};
