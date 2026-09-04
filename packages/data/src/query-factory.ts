import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

/**
 * A small factory that standardizes react-query usage across the platform.
 * Give it a domain name + list/detail/mutation key builders and it returns
 * typed hooks with stable, consistent query keys and invalidation helpers.
 */
export interface QueryFactoryConfig<TEntity, TListParams> {
  /** Stable domain prefix, e.g. "products" or "users". */
  baseKey: readonly string[];
  /** Key builder for a list query. */
  listKey?: (params: TListParams) => QueryKey;
  /** Key builder for a detail query. */
  detailKey?: (id: string | number) => QueryKey;
  /** Fetch a single page/list. */
  listFetcher?: (params: TListParams) => Promise<TEntity[]>;
  /** Fetch a single entity. */
  detailFetcher?: (id: string | number) => Promise<TEntity>;
}

export function createQueryFactory<TEntity, TListParams>(config: QueryFactoryConfig<TEntity, TListParams>) {
  const baseKey = config.baseKey;

  const listKey = (params: TListParams): QueryKey =>
    config.listKey ? config.listKey(params) : [...baseKey, "list", params];
  const detailKey = (id: string | number): QueryKey =>
    config.detailKey ? config.detailKey(id) : [...baseKey, "detail", id];

  return {
    baseKey,
    listKey,
    detailKey,

    useList(
      params: TListParams,
      options?: UseQueryOptions<TEntity[], Error, TEntity[], QueryKey>,
    ) {
      return useQuery({
        queryKey: listKey(params),
        queryFn: () => config.listFetcher!(params),
        enabled: !!config.listFetcher && !!params,
        ...options,
      });
    },

    useDetail(
      id: string | number,
      options?: UseQueryOptions<TEntity, Error, TEntity, QueryKey>,
    ) {
      return useQuery({
        queryKey: detailKey(id),
        queryFn: () => config.detailFetcher!(id),
        enabled: !!config.detailFetcher && !!id,
        ...options,
      });
    },

    /**
     * Standard mutation hook — on success invalidates the whole domain subtree
     * (lists + details) by default.
     */
    usePlatMutation<TVars, TReturn>(
      mutationFn: (vars: TVars) => Promise<TReturn>,
      options?: UseMutationOptions<TReturn, Error, TVars>,
    ) {
      const client = useQueryClient();
      const externalOnSuccess = options?.onSuccess as
        | ((data: TReturn, variables: TVars) => void | Promise<void>)
        | undefined;
      return useMutation<TReturn, Error, TVars>({
        mutationFn,
        onSuccess: async (data, variables) => {
          await client.invalidateQueries({ queryKey: baseKey });
          externalOnSuccess?.(data, variables);
        },
        onError: options?.onError,
        onMutate: options?.onMutate,
      });
    },
  };
}
