import * as Sentry from "@sentry/react";

/**
 * 중앙 에러 핸들링 유틸
 * 모든 API 호출 또는 예외 처리 영역에서 이 함수를 통해 Sentry 로깅
 */
export const captureError = (
    error: unknown,
    context?: string,
    tags?: Record<string, string>,
    extra?: Record<string, any>
) => {
    Sentry.captureException(error, {
        tags: {
            location: context || "unknown",
            ...tags,
        },
        extra,
    });
};

/**
 * 안전한 요청 처리기
 * 실패하더라도 Sentry에만 로깅하고 UI에는 영향 주지 않도록 함
 */
export const safeRequest = async <T>(
    fn: () => Promise<T>,
    context?: string,
    tags?: Record<string, string>,
    extra?: Record<string, any>
): Promise<T | null> => {
    try {
        return await fn();
    } catch (error) {
        captureError(error, context, tags, extra);
        return null;
    }
};

/**
 * 수동 사용자 이벤트 로깅 예시
 * @param message 설명 메시지
 * @param level 로그 레벨 (info, warning, error...)
 */
export const logUserEvent = (
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: string
) => {
    Sentry.captureMessage(message, level);
    if (context) {
        Sentry.setTag("user_event_context", context);
    }
};

/**
 * 로그인 성공 후 사용자 정보 등록
 */
export const setSentryUser = (user: { id: string; nickname: string }) => {
    Sentry.setUser({ id: user.id, username: user.nickname });
};
