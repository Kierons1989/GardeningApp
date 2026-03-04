export function getOwnerUserId(): string {
  const id = process.env.NEXT_PUBLIC_OWNER_USER_ID
  if (!id) {
    throw new Error('NEXT_PUBLIC_OWNER_USER_ID environment variable is not set')
  }
  return id
}
