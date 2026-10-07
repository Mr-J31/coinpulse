import React from 'react'
import { fetcher, getPools } from "@/lib/coingecko.actions";
import { formatCurrency } from '@/lib/utils'
import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import LiveDataWrapper from '@/components/LiveDataWrapper'
import { PERIOD_CONFIG } from '@/constants';
import Converter from "@/components/Converter";
import TopGainersLosers from '@/components/TopGainersLosers';

const Page = async ({ params }: NextPageProps) => {
    const { id } = await params;

    // مقدار اولیه با دوره‌ی پیش‌فرض چارت (daily) هماهنگ است
    const { days, interval } = PERIOD_CONFIG['daily'];

    const [coinData, coinOHLCData] = await Promise.all([
        fetcher<CoinDetailsData>(`/coins/${id}`, {
            dex_pair_format: 'contract_address',
        }),
        fetcher<OHLCData[]>(`/coins/${id}/ohlc`, {
            vs_currency: 'usd',
            days,
            ...(interval ? { interval } : {}),
            precision: 'full',
        }),
    ]);

    const platform = coinData.asset_platform_id
        ? coinData.detail_platforms?.[coinData.asset_platform_id]
        : null;
    const network = platform?.geckoterminal_url?.split('/')[3] || null;
    const contractAddress = platform?.contract_address || null;

    const pool = await getPools(id, network, contractAddress);

    const coinDetails = [
        {
            label: 'Market Cap',
            value: formatCurrency(coinData.market_data.market_cap.usd),
        },
        {
            label: 'Market Cap Rank',
            value: `# ${coinData.market_cap_rank}`,
        },
        {
            label: 'Total Volume',
            value: formatCurrency(coinData.market_data.total_volume.usd),
        },
        {
            label: 'Website',
            value: '_',
            link: coinData.links.homepage?.find(Boolean),
            linkText: 'Homepage',
        },
        {
            label: 'Explorer',
            value: '_',
            link: coinData.links.blockchain_site?.find(Boolean),
            linkText: 'Explorer',
        },
        {
            label: 'Community',
            value: '_',
            link: coinData.links.subreddit_url,
            linkText: 'Community',
        },
    ]

    return (
        <main id='coin-details-page'>
            <section className='primary'>
                <div className='mb-3'>
                    <Link
                        href='/coins'
                        aria-label='Back to all coins'
                        className='inline-flex items-center gap-2 mb-4 text-purple-100 hover:text-white transition-all font-medium'
                    >
                        <ArrowLeft size={20} />
                        <span className='font-bold'>Back</span>
                    </Link>
                </div>
                <LiveDataWrapper
                    coinId={id}
                    poolId={pool.id}
                    coin={coinData}
                    coinOHLCData={Array.isArray(coinOHLCData) ? coinOHLCData : []}
                >
                    <h4>Exchange Listing</h4>
                </LiveDataWrapper>
            </section>

            <section className='secondary'>
                <Converter
                    symbol={coinData.symbol}
                    icon={coinData.image.small}
                    priceList={coinData.market_data.current_price}
                />
                <div className='details'>
                    <h4>Coin Details</h4>
                    <ul className='details-grid'>
                        {coinDetails.map(({ label, value, link, linkText }, index) => (
                            <li key={index}>
                                <p>{label}</p>

                                {link ? (
                                    <div className='link'>
                                        <Link href={link} target='_blank'>{linkText || label}</Link>
                                        <ArrowUpRight size={16} />
                                    </div>
                                ) : (
                                    <p className='text-base font-medium'>{value}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <TopGainersLosers />
            </section>
        </main>
    )
}

export default Page