import { ChangeEvent, useEffect } from "react";

import {
  queryOptions,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { z } from "zod";

import { PriceFilter } from "@/components/browse/price-filter";
import { QuickFilters } from "@/components/browse/quick-filters";
import { BrowseSort } from "@/components/browse/sort";
import { TagsFilter } from "@/components/browse/tags-filter";
import { Game } from "@/components/game";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  GamesFilters,
  PaginatedGames,
  RecommendedGamesFilters,
} from "@/domain/game";
import { getGames, getRecommendedGames, getTags } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { gamesQueryKey } from "@/lib/query-keys";
import { getBatchPaginatedResponse } from "@/lib/request";
import { debounce, getVisiblePages, updateSearchParams } from "@/lib/utils";

const VISIBLE_PAGES = 3;
const PAGE_SIZE = 16;

const browseSearchSchema = z
  .object({
    page: z.number().min(1).catch(1),
    title: z
      .preprocess((value) => decodeURIComponent(String(value)), z.string())
      .optional(),
    tags: z
      .union([z.string().uuid(), z.string().uuid().array()])
      .optional()
      .catch(undefined),
    price: z
      .enum(["free", "under-10", "under-20", "above-50"])
      .optional()
      .catch(undefined),
    quickFilter: z
      .enum(["recommended", "upcoming-releases", "best-sellers"])
      .optional()
      .catch(undefined),
    sort: z.enum(["price", "title", "releaseDate"]).optional().catch("price"),
    order: z.enum(["asc", "desc"]).optional().catch("asc"),
  })
  .transform((search) => {
    if (search.quickFilter) {
      search.title = undefined;
      search.tags = undefined;
      search.price = undefined;
      search.sort = undefined;
      search.order = undefined;
    } else {
      if (!search.sort) {
      search.sort = "price";
      }

      if (!search.order) {
      search.order = "asc";
    }
    }

    return search;
  });

export type BrowseSearchSchemaType = z.infer<typeof browseSearchSchema>;

/**
 * Query options for retrieving the games in the browse page.
 * @param search Search params.
 * @returns Query options.
 */
function gamesQueryOptions(search: BrowseSearchSchemaType) {
  const limit = PAGE_SIZE;
  const offset = PAGE_SIZE * (search.page - 1);

  let filters: GamesFilters | RecommendedGamesFilters = {
    isActive: true,
    limit,
    offset,
  };
  if (search.sort) {
    filters.sort = search.sort;
  }
  if (search.order) {
    filters.order = search.order;
  }
  if (search.title) {
    filters.title = search.title;
  }
  if (search.tags) {
    filters.tagIds = Array.isArray(search.tags) ? search.tags : [search.tags];
  }
  if (search.price) {
    switch (search.price) {
      case "free":
        filters.priceUnder = 0;
        break;
      case "under-10":
        filters.priceUnder = 10;
        break;
      case "under-20":
        filters.priceUnder = 20;
        break;
      case "above-50":
        filters.priceAbove = 50;
        break;
    }
  }

  if (search.quickFilter) {
    switch (search.quickFilter) {
      case "recommended": {
        try {
          const token = getToken();
          const payload = decodeTokenPayload(token);

          if (payload.roles.includes("user")) {
            filters = {
              userId: payload.sub,
              limit,
              offset,
            };
          }
        } catch {
          // Ignore the error if the user is not signed in.
        }
        break;
      }
      case "upcoming-releases":
        filters.releaseDateAfter = format(new Date(), "yyyy-MM-dd");
        filters.sort = "releaseDate";
        filters.order = "asc";
        break;
      case "best-sellers":
        filters.sort = "userCount";
        filters.order = "desc";
        break;
    }
  }

  return queryOptions({
    queryKey: gamesQueryKey(filters),
    async queryFn() {
      const gamesPromise =
        "userId" in filters ? getRecommendedGames(filters) : getGames(filters);

      const [games, tags] = await Promise.all([
        gamesPromise,
        getBatchPaginatedResponse(async (limit, offset) => {
          const paginatedTags = await getTags({ limit, offset });
          return {
            total: paginatedTags.total,
            items: paginatedTags.tags,
          };
        }),
      ]);

      return {
        games,
        tags,
      };
    },
  });
}

export const Route = createFileRoute("/_layout/browse")({
  component: Component,
  validateSearch: browseSearchSchema,
  loaderDeps(deps) {
    return deps.search as BrowseSearchSchemaType;
  },
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(
      gamesQueryOptions(opts.deps),
    );
  },
});

function Component() {
  const search = Route.useSearch();
  const query = useSuspenseQuery(gamesQueryOptions(search));

  const paginatedGames = query.data.games;
  const games = paginatedGames.games;
  const totalGames = paginatedGames.total;

  const tags = query.data.tags;

  const state = useBrowse(paginatedGames, search);

  return (
    <div className="container mx-auto bg-background text-foreground min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Browse</h1>

      <div className="mb-4">
        <Input
          className="w-full bg-input text-foreground"
          placeholder="Search games..."
          onChange={debounce((event: ChangeEvent<HTMLInputElement>) =>
            state.filterByTitle(event.target.value),
          )}
        />
      </div>

      <div className="flex items-center justify-end mb-8">
        <BrowseSort
          order={search.order}
          quickFilter={search.quickFilter}
          sort={search.sort}
          onSelect={(sort, order) => state.sortBy(sort, order)}
        />
      </div>

      <div className="h-full grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-1 space-y-6">
          <QuickFilters
            selectedQuickFilter={search.quickFilter}
            onSelect={(id) => state.filterByQuickFilter(id)}
          />

          <PriceFilter
            selectedPrice={search.price}
            onSelect={(id) => state.filterByPrice(id)}
          />

          <TagsFilter
            selectedTags={search.tags}
            tags={tags}
            onSelect={(id) => state.filterByTag(id)}
          />
        </div>

        <div className="flex flex-col md:col-span-3">
          {totalGames === 0 && !state.areFiltersApplied ? (
            <NoResults
              title="No games available in the store"
              description="We're sorry, but there are no games available right now. Please check
        back later."
            />
          ) : games.length === 0 ? (
            <NoResults
              description="Try adjusting your filters."
              title="No games were found"
            />
          ) : (
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 *:mx-auto">
              {games.map((game) => (
                <Link
                  key={game.id}
                  className="w-fit max-w-full"
                  to="/games/$gameId"
                  params={{
                    gameId: game.id,
                  }}
                >
                  <Game
                    image={game.previewMultimedia.url}
                    price={game.price}
                    publisher={game.publisher.name}
                    title={game.title}
                  />
                </Link>
              ))}
            </div>
          )}

          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={!state.hasPreviousPage}
                  onClick={state.fetchPreviousPage}
                />
              </PaginationItem>
              {getVisiblePages(
                Array.from({ length: state.pages }, (_, idx) => idx),
                search.page - 1,
                VISIBLE_PAGES,
              ).map((pageIndex) => {
                const page = pageIndex + 1;

                return (
                  <PaginationItem key={pageIndex}>
                    <PaginationLink
                      isActive={search.page === page}
                      onClick={() => state.fetchPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  disabled={!state.hasNextPage}
                  onClick={state.fetchNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

function NoResults(props: { title: string; description: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 h-full pt-32">
      <h3 className="text-2xl font-semibold">{props.title}</h3>
      <p className="text-sm text-muted-foreground">{props.description}</p>
    </div>
  );
}

/**
 * Hook that handles the data logic of the browse page.
 * @param paginatedGames Paginated games
 * @param search Browse search params.
 * @returns Browse page state.
 */
function useBrowse(
  paginatedGames: PaginatedGames,
  search: BrowseSearchSchemaType,
) {
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();

  /**
   * Filters games by game title.
   * @param title Game title.
   */
  async function filterByTitle(title: BrowseSearchSchemaType["title"]) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("page", "1");
    searchParams.delete("quickFilter");
    searchParams.set("title", encodeURIComponent(title ?? ""));

    updateSearchParams(searchParams);

    await queryClient.invalidateQueries({ queryKey: gamesQueryKey() });
  }

  /**
   * Filters games by tag.
   * @param tag Tag. When undefined, existing selected tags are cleared.
   */
  async function filterByTag(tag: string | undefined) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("page", "1");
    searchParams.delete("quickFilter");

    const existingTags = searchParams.getAll("tags");

    if (existingTags.some((searchTag) => searchTag === tag)) {
      searchParams.delete("tags", tag);
    } else if (tag) {
      searchParams.append("tags", tag);
    } else {
      searchParams.delete("tags");
    }

    updateSearchParams(searchParams);

    await queryClient.invalidateQueries({ queryKey: gamesQueryKey() });
  }

  /**
   * Filters games by price.
   * @param price Price filter.
   */
  async function filterByPrice(price: BrowseSearchSchemaType["price"]) {
    await navigate({
      search(prev) {
        return {
          ...prev,
          price,
          page: 1,
          quickFilter: undefined,
        };
      },
    });
  }

  /**
   * Filters games by a quick filter.
   * @param quickFilter Quick filter.
   */
  async function filterByQuickFilter(
    quickFilter: BrowseSearchSchemaType["quickFilter"],
  ) {
    await navigate({
      search() {
        return {
          page: 1,
          quickFilter,
        };
      },
    });
  }

  /**
   * Sorts games by a given sort field and order..
   * @param sort Sort field.
   * @param order Order field.
   */
  async function sortBy(
    sort: BrowseSearchSchemaType["sort"],
    order: BrowseSearchSchemaType["order"],
  ) {
    await navigate({
      search(prev) {
        return {
          ...prev,
          page: 1,
          sort,
          order,
          quickFilter: undefined,
        };
      },
    });
  }

  /**
   * Fetches a given pagination page.
   * @param page Pagination page.
   */
  async function fetchPage(page: number) {
    await navigate({
      search(prev) {
        return {
          ...prev,
          page,
        };
      },
    });
  }

  /**
   * Fetches the previous pagination page.
   */
  async function fetchPreviousPage() {
    await fetchPage(search.page - 1);
  }

  /**
   * Fetches the next pagination page.
   */
  async function fetchNextPage() {
    await fetchPage(search.page + 1);
  }

  useEffect(() => {
    // Sets the user to the first page when the game available in the store are
    // are less that the requested one's and the pagination page is greater that one.
    if (paginatedGames.total < PAGE_SIZE && search.page > 1) {
      void navigate({
        search(prev) {
          return {
            ...prev,
            page: 1,
          };
        },
      });
    }
  }, [paginatedGames.total, navigate, search.page]);

  return {
    areFiltersApplied: !!(
      search.page > 1 ||
      search.title ||
      search.tags ||
      search.quickFilter ||
      search.price !== undefined
    ),

    pages:
      paginatedGames.total > 0
        ? Math.ceil(paginatedGames.total / PAGE_SIZE)
        : 1,
    hasPreviousPage: search.page > 1,
    hasNextPage: paginatedGames.total > PAGE_SIZE * search.page,

    filterByTitle,
    filterByTag,
    filterByPrice,
    filterByQuickFilter,
    sortBy,

    fetchPage,
    fetchPreviousPage,
    fetchNextPage,
  };
}
