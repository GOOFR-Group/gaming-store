import { PayloadMissing, TokenMissing, Unauthorized } from "./errors";

/**
 * Handles useMutation authentication errors.
 * @param fn Callback function.
 * @returns useMutation onError function.
 */
export function withAuthErrors<TError, TVariables, TContext>(
  fn: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined,
  ) => unknown,
) {
  return (
    error: TError,
    variables: TVariables,
    context: TContext | undefined,
  ) => {
    if (
      error instanceof Unauthorized ||
      error instanceof TokenMissing ||
      error instanceof PayloadMissing
    ) {
      window.location.replace(
        window.location.pathname.startsWith("/distribute")
          ? "/distribute/signin"
          : "/signin",
      );
      return;
    }

    fn(error, variables, context);
  };
}
