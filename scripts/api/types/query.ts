export interface CollectionQuery {
  username: string
  folderId: number
  options?: Options
}

export interface Options {
  page?: number
  per_page?: number
  sort?: Sort
  sort_order?: SortOrder
}

type Sort = 'added' | 'artist' | 'format' | 'label' | 'rating' | 'released' | 'title'
type SortOrder = 'asc' | 'desc'
