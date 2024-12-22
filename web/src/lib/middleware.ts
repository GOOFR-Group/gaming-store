import { TokenMissing, TokenPayloadMissing, Unauthorized } from "./errors";

/**
 * Handles useMutation authentication errors.
 * @param fn Callback function.
 * @returns useMutation onError function.
 */
export function withAuthErrors<TError, TVariables, TContext>(
  fn?: (error: TError, variables?: TVariables, context?: TContext) => unknown,
) {
  return (error: TError, variables?: TVariables, context?: TContext) => {
    if (
      error instanceof Unauthorized ||
      error instanceof TokenMissing ||
      error instanceof TokenPayloadMissing
    ) {
      window.location.replace(
        window.location.pathname.startsWith("/distribute")
          ? "/distribute/signin"
          : "/signin",
      );
      return;
    }

    fn?.(error, variables, context);
  };
}
