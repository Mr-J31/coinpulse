import Image from 'next/image';
import Link from 'next/link';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetcher } from '@/lib/coingecko.actions';
import { cn, formatCurrency } from '@/lib/utils';

type MarketCoin = {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number | null;
};

const LIST_SIZE = 6;

const CoinRow = ({ coin }: { coin: MarketCoin }) => {
    const change = coin.price_change_percentage_24h ?? 0;
    const isUp = change >= 0;

    return (
        <Link href={`/coins/${coin.id}`} className='gl-item'>
            <div className='coin'>
                <Image src={coin.image} alt={coin.name} width={36} height={36} />
                <div className='min-w-0'>
                    <p className='name'>{coin.name}</p>
                    <p className='symbol'>{coin.symbol}</p>
                </div>
            </div>

            <div className='values'>
                <p className='price'>{formatCurrency(coin.current_price)}</p>
                <p className={cn('change', isUp ? 'text-green-500' : 'text-red-500')}>
                    {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(change).toFixed(2)}%
                </p>
            </div>
        </Link>
    );
};

const TopGainersLosers = async () => {
    let coins: MarketCoin[] = [];

    try {
        coins = await fetcher<MarketCoin[]>('/coins/markets', {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 100,
            page: 1,
            price_change_percentage: '24h',
        });
    } catch (error) {
        console.error('Failed to fetch top gainers/losers', error);
    }

    const valid = (Array.isArray(coins) ? coins : []).filter(
        (c) => typeof c.price_change_percentage_24h === 'number'
    );

    const sorted = [...valid].sort(
        (a, b) => b.price_change_percentage_24h! - a.price_change_percentage_24h!
    );

    const gainers = sorted.slice(0, LIST_SIZE);
    const losers = sorted.slice(-LIST_SIZE).reverse();

    return (
        <div id='top-gainers-losers'>
            <Tabs defaultValue='gainers' className='w-full flex flex-col gap-0'>
                <TabsList className='tabs-list'>
                    <TabsTrigger value='gainers' className='tabs-trigger'>
                        Top Gainers
                    </TabsTrigger>
                    <TabsTrigger value='losers' className='tabs-trigger'>
                        Top Losers
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='gainers' className='tabs-content w-full min-w-0'>
                    {gainers.map((coin) => (
                        <CoinRow key={coin.id} coin={coin} />
                    ))}
                </TabsContent>

                <TabsContent value='losers' className='tabs-content w-full min-w-0'>
                    {losers.map((coin) => (
                        <CoinRow key={coin.id} coin={coin} />
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TopGainersLosers;