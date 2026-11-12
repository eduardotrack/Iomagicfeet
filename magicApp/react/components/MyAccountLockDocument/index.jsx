import { useRuntime } from 'vtex.render-runtime'

import { useLockProfileDocument } from './useLockProfileDocument'

export function MyAccountLockDocument({ children }) {
  const { page } = useRuntime()

  useLockProfileDocument(page)

  return children ?? null
}
