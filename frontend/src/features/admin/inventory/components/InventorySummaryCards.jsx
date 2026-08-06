import React from "react";
import { Package, Layers, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function InventorySummaryCards({ summary, loading }) {
    const stats = [
        {
            title: "Total Products",
            value: summary?.total_products || 0,
            icon: <Package size={20} />,
            badge: "Catalog",
            theme: "blue",
        },
        {
            title: "Total Variants",
            value: summary?.total_variants || 0,
            icon: <Layers size={20} />,
            badge: "SKUs",
            theme: "purple",
        },
        {
            title: "In Stock",
            value: summary?.in_stock || 0,
            icon: <CheckCircle2 size={20} />,
            badge: "Healthy",
            theme: "green",
        },
        {
            title: "Low Stock",
            value: summary?.low_stock || 0,
            icon: <AlertTriangle size={20} />,
            badge: "1-5 Left",
            theme: "orange",
        },
        {
            title: "Out of Stock",
            value: summary?.out_of_stock || 0,
            icon: <XCircle size={20} />,
            badge: "Restock Required",
            theme: "red",
        },
    ];

    if (loading) {
        return (
            <div className="inventory-summary-cards-grid">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="inventory-kpi-card skeleton-shimmer" style={{ height: "100px" }} />
                ))}
            </div>
        );
    }

    return (
        <div className="inventory-summary-cards-grid">
            {stats.map((stat, i) => (
                <div key={i} className={`inventory-kpi-card theme-${stat.theme}`}>
                    <div className="kpi-card-header">
                        <span className="kpi-icon-badge">{stat.icon}</span>
                        <span className="kpi-status-tag">{stat.badge}</span>
                    </div>
                    <div className="kpi-card-body">
                        <h3 className="kpi-value">{stat.value}</h3>
                        <p className="kpi-title">{stat.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default InventorySummaryCards;
