// src/redux/api/gamesApi.ts
import { baseApi } from "./baseApi";

export interface Game {
  _id: string;
  game_code: string;
  game_name: string;
  game_image: string;
  game_type: string;
  platform: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

interface GamesByProviderResponse {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    total: number;
  };
  data: Game[];
}
interface GamesByCategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    total: number;
  };
  data: Game[];
}
export type GamesByCategoryArg = { category: string; provider?: string };

export const gamesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroupedGames: builder.query<{
      success: boolean;
      statusCode: number;
      message: string;
      data: {
        categories: string[];
        provider: string;
        games: {
          [category: string]: Game[];
        };
      }[];
    }, void>({
      query: () => `/allgames/group-by-provider`,
      providesTags: [{ type: "GroupedGames" }],
    }),

    getGamesByProvider: builder.query<GamesByProviderResponse, string>({
      query: (provider) => `/allgames?provider=${provider}`,
      providesTags: (result, error, provider) => [{ type: "GamesByProvider", id: provider }],
    }),
    getGamesByCategory: builder.query<GamesByCategoryResponse, GamesByCategoryArg>({
      query: ({ category, provider }) => {
        const qp = new URLSearchParams({ category });
        if (provider) qp.set("provider", provider);
        return `/allgames?${qp.toString()}`;
      },
      providesTags: (_result, _err, { category, provider }) => [
        { type: "GamesByCategory", id: provider ? `${category}:${provider}` : category },
      ],
    }),
  }),
});

export const {
  useGetGroupedGamesQuery,
  useGetGamesByProviderQuery,
  useGetGamesByCategoryQuery,
} = gamesApi;
