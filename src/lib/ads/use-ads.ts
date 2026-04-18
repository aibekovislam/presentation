'use client'

import { useState, useEffect, useCallback } from 'react'

import type { PaginatedResponse, PaginationParams } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FetchFn<T> = (params: any) => Promise<PaginatedResponse<T>>

interface UseAdsOptions {
  initialPage?: number
  limit?: number
}

export function useAds<T>(
  fetchFn: FetchFn<T>,
  buildParams: () => PaginationParams,
  options: UseAdsOptions = {},
) {
  const { initialPage = 1, limit = 20 } = options

  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(
    async (targetPage: number) => {
      setIsLoading(true)

      try {
        const params = { ...buildParams(), page: targetPage, limit }
        const data = await fetchFn(params)

        setItems(data.items)
        setPage(data.page)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      } catch {
        setItems([])
        setTotalPages(1)
        setTotal(0)
      } finally {
        setIsLoading(false)
      }
    },
    [fetchFn, buildParams, limit],
  )

  useEffect(() => {
    load(initialPage)
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const search = useCallback(() => {
    setPage(1)
    load(1)
  }, [load])

  const goToPage = useCallback(
    (p: number) => {
      setPage(p)
      load(p)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [load],
  )

  return { items, page, totalPages, total, isLoading, search, goToPage }
}
