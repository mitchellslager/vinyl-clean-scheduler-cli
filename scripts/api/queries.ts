import { request, buildUrl } from '~scripts/api/client'
import { CollectionQuery } from '~scripts/api/types/query'
import { CollectionResponse } from '~scripts/api/types/response'

export const getCollection = ({
  username,
  folderId,
  options,
}: CollectionQuery): Promise<CollectionResponse> => {
  const path = `users/${username}/collection/folders/${folderId}/releases`
  const url = buildUrl(path, options)
  return request(url)
}
