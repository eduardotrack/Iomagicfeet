import { IOClients, method, Service } from '@vtex/api'
import type { ParamsContext, RecorderState, ServiceContext } from '@vtex/api'

import { subscribeAvailability } from './routes/subscribeAvailability'

export type Context = ServiceContext<IOClients, RecorderState>

export default new Service<IOClients, RecorderState, ParamsContext>({
  clients: {
    implementation: IOClients,
    options: {
      default: { retries: 0, timeout: 5000 },
      masterdata: { retries: 0, timeout: 5000 },
    },
  },
  routes: {
    subscribeAvailability: method({ POST: [subscribeAvailability] }),
  },
})
