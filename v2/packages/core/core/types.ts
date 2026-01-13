export type RpcRequest = {
  id: string
  method: string
  params: unknown
}

export type RpcResponse = {
  id: string
  result?: unknown
  error?: string
}
