'use client'
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/coingecko.actions";

type RawTrade = {
    attributes: {
        block_timestamp: string;
        kind: 'buy' | 'sell';
        from_token_amount: string;
        to_token_amount: string;
        price_from_in_usd: string;
        price_to_in_usd: string;
        volume_in_usd: string;
    };
};

// جایگزین REST برای وقتی که WebSocket (پلن پولی) در دسترس نیست
export const useRecentTrades = (poolId: string, intervalMs = 15000) => {
    const [trades, setTrades] = useState<Trade[]>([]);

    useEffect(() => {
        if (!poolId) {
            setTrades([]);
            return;
        }

        // poolId شبیه "eth_0xabc..." است
        const sep = poolId.indexOf('_');
        if (sep === -1) return;
        const network = poolId.slice(0, sep);
        const address = poolId.slice(sep + 1);

        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetcher<{ data: RawTrade[] }>(
                    `/onchain/networks/${network}/pools/${address}/trades`,
                    undefined,
                    10,
                );
                if (cancelled) return;

                const mapped: Trade[] = (res.data ?? []).slice(0, 7).map(({ attributes: a }) => {
                    const isBuy = a.kind === 'buy';
                    return {
                        price: Number(isBuy ? a.price_to_in_usd : a.price_from_in_usd),
                        amount: Number(isBuy ? a.to_token_amount : a.from_token_amount),
                        value: Number(a.volume_in_usd),
                        type: isBuy ? 'b' : 's',
                        timestamp: Date.parse(a.block_timestamp),
                    } as Trade;
                });
                setTrades(mapped);
            } catch (e) {
                console.error('Failed to fetch recent trades', e);
            }
        };

        load();
        const timer = setInterval(load, intervalMs);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [poolId, intervalMs]);

    return trades;
};
