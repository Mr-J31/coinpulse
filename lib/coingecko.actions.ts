'use server'

import qs from 'query-string';

export async function fetcher<T>(
    endpoint: string,
    params?: QueryParams,
    revalidate: number = 60,
): Promise<T> {
    const BASE_URL = process.env.COINGECKO_BASE_URL;
    const API_KEY = process.env.COINGECKO_API_KEY;

    if (!BASE_URL) throw new Error('Could not get base url');
    if (!API_KEY) throw new Error('Could not get API key');

    // مقاوم در برابر اسلش اضافه در آخر BASE_URL یا اول endpoint
    const base = BASE_URL.trim().replace(/\/+$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const url = qs.stringifyUrl(
        {
            url: `${base}${path}`,
            query: params,
        },
        {
            skipEmptyString: true,
            skipNull: true,
        }
    );

    const response = await fetch(url, {
        headers: {
            // اگر پلن Pro دارید: "x-cg-pro-api-key"
            "x-cg-demo-api-key": API_KEY.trim(),
            "Content-Type": "application/json",
        },
        next: { revalidate },
    });

    if (!response.ok) {
        const errorBody: CoinGeckoErrorBody =
            await response.json().catch(() => ({}));

        throw new Error(
            `API Error: ${response.status}: ${
                errorBody.error || response.statusText
            } (${url})`
        );
    }

    return response.json();
}

export async function getPools(
    id: string,
    network?: string | null,
    contractAddress?: string | null
): Promise<PoolData> {
    const fallback: PoolData = {
        id: "",
        address: "",
        name: "",
        network: "",
    };

    try {
        if (network && contractAddress) {
            const poolData = await fetcher<{ data: PoolData[] }>(
                `/onchain/networks/${network}/tokens/${contractAddress}/pools`
            );

            return poolData.data?.[0] ?? fallback;
        }

        const poolData = await fetcher<{ data: PoolData[] }>(
            "/onchain/search/pools",
            { query: id }
        );

        return poolData.data?.[0] ?? fallback;
    } catch {
        return fallback;
    }
}

export async function searchCoins(query: string): Promise<SearchCoin[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // مرحله ۱: نام و نماد (بدون قیمت)
    const searchData = await fetcher<{
        coins: { id: string; name: string; symbol: string; thumb: string; large: string }[];
    }>('/search', { query: trimmed });

    const topCoins = (searchData.coins ?? []).slice(0, 10);
    if (topCoins.length === 0) return [];

    // مرحله ۲: قیمت و تغییر ۲۴ ساعته برای همین idها
    const markets = await fetcher<
        { id: string; current_price: number; price_change_percentage_24h: number | null }[]
    >('/coins/markets', {
        vs_currency: 'usd',
        ids: topCoins.map((coin) => coin.id).join(','),
        price_change_percentage: '24h',
    });

    const marketById = new Map(markets.map((m) => [m.id, m]));

    // ادغام دو نتیجه
    return topCoins.map((coin) => {
        const market = marketById.get(coin.id);
        return {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            thumb: coin.thumb,
            large: coin.large,
            data: {
                price: market?.current_price,
                price_change_percentage_24h: market?.price_change_percentage_24h ?? 0,
            },
        };
    });
}