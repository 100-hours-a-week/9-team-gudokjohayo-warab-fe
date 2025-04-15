import * as Sentry from "@sentry/react";
import { browserTracingIntegration } from "@sentry/browser";

export const initSentry = () => {
    Sentry.init({
        dsn: "https://f3147520594016c834d0853f49a0aecf@o4509127330627584.ingest.us.sentry.io/4509127342489600",
        integrations: [browserTracingIntegration(), Sentry.replayIntegration()],
        tracesSampleRate: 1.0,
        environment: process.env.NODE_ENV,
    });
};

export const captureError = (error: unknown, context?: string) => {
    Sentry.captureException(error, {
        extra: {
            context: context ?? "Unhandled error",
        },
    });
};
