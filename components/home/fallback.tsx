import React from "react";
import DataTable from "@/components/DataTable";

export const CoinOverviewFallback = () => {
    return (
        <div id="coin-overview-fallback">
            <div className="header pt-2">
                <div className="header-image skeleton" />
                <div className="info">
                    <div className="header-line-sm skeleton" />
                    <div className="header-line-lg skeleton" />
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="period-button-skeleton skeleton" />
                ))}
            </div>

            <div className="chart">
                <div className="chart-skeleton skeleton" />
            </div>
        </div>
    );
};

export const TrendingCoinsFallback = () => {
    const columns: DataTableColumn<number>[] = [
        {
            header: "Name",
            cellClassName: "name-cell",
            cell: () => (
                <div className="name-link">
                    <div className="name-image skeleton" />
                    <div className="name-line skeleton" />
                </div>
            ),
        },
        {
            header: "24h Change",
            cellClassName: "change-cell",
            cell: () => (
                <div className="price-change">
                    <div className="change-icon skeleton" />
                    <div className="change-line skeleton" />
                </div>
            ),
        },
        {
            header: "Price",
            cellClassName: "price-cell",
            cell: () => <div className="price-line skeleton" />,
        },
    ];

    const dummyData = Array.from({ length: 6 }, (_, i) => i);

    return (
        <div id="trending-coins-fallback">
            <h4>Trending Coins</h4>
            <DataTable
                data={dummyData}
                columns={columns}
                rowKey={(index) => index}
                tableClassName="trending-coins-table"
                headerCellClassName="py-3!"
                bodyCellClassName="py-2!"
            />
        </div>
    );
};