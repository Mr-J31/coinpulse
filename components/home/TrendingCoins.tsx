import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";
import { TrendingUp, TrendingDown } from "lucide-react";
import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import DataTable from "@/components/DataTable";

const TrendingCoins = async () => {
  const trendingCoins = await fetcher<{ coins: TrendingCoin[] }>(
      "/search/trending",
      undefined,
      300,
  );

  const columns: DataTableColumn<TrendingCoin>[] = [
    {
      header: "Name",
      cellClassName: "name-cell",
      cell: (coin) => {
        const item = coin.item;

        return (
            <Link href={`/coin/${item.id}`}>
              <Image src={item.large} alt={item.name} width={36} height={36} />
              <p>{item.name}</p>
            </Link>
        );
      },
    },
    {
      header: "24h Change",
      cellClassName: "change-cell",
      cell: (coin) => {
        const item = coin.item;
        const change = item.data.price_change_percentage_24h.usd;
        const isTrendingUp = change > 0;

        return (
            <div
                className={cn('price-change', isTrendingUp ? 'text-green-500' : 'text-red-500'
                )}>
              <p className='flex items-center'>
                  {formatCurrency(item.data.price_change_percentage_24h.usd)}
                  {isTrendingUp ? (
                      <TrendingUp width={16} height={16} />
                  ) : (
                      <TrendingDown width={16} height={16} />
                  )}
              </p>

            </div>
        );
      },
    },
    {
      header: "Price",
      cellClassName: "price-cell",
      cell: (coin) => <p>{formatCurrency(coin.item.data.price)}</p>,
    },
  ];

  return (
      <div id="trending-coins">
        <h4>Trending Coins</h4>
        <DataTable
            data={trendingCoins.coins?.slice(0, 6) ?? []}
            columns={columns}
            rowKey={(coin) => coin.item.id}
            tableClassName="trending-coins-table"
            headerCellClassName="py-5!"
            bodyCellClassName="py-3!"
        />
      </div>
  );
};

export default TrendingCoins;