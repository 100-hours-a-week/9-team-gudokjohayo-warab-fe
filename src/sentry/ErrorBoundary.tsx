import * as Sentry from "@sentry/react";
import React from "react";

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    return (
        <Sentry.ErrorBoundary
            fallback={<p>문제가 발생했어요. 잠시 후 다시 시도해주세요.</p>}
            showDialog
        >
            {children}
        </Sentry.ErrorBoundary>
    );
};

export default ErrorBoundary;
