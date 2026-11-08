/** Keep the tooling process alive until its native callback settles. */
export async function withNativeLifetime(operation) {
  const lifetime = setInterval(() => {}, 60_000);
  try {
    await operation();
  } finally {
    clearInterval(lifetime);
  }
}
