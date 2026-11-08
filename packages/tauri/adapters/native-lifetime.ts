/** Keep Bun alive until a native thread reports completion, including rejection. */
export async function withNativeLifetime(operation: () => Promise<void>): Promise<void> {
  const lifetime = setInterval(() => {}, 60_000);
  try {
    await operation();
  } finally {
    clearInterval(lifetime);
  }
}
