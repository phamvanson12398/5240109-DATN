import React from 'react';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import formatVND from '@/shared/utils/formatCurrency.js';

export default function KPISection({ stats }) {
    if (!stats) return null;

    const totalRev = stats.totalRevenue?.value ?? 0;
    const revChange = stats.totalRevenue?.change ?? 0;
    const totalOrd = stats.totalOrders?.value ?? 0;
    const totalProd = stats.totalProducts?.value ?? 0;
    const totalUsr = stats.totalUsers?.value ?? 0;

    const cards = [
        {
            title: 'Doanh thu',
            value: formatVND(totalRev),
            meta: `${revChange >= 0 ? '+' : ''}${revChange}% so với kỳ trước`,
            icon: <PaymentsOutlinedIcon />,
            tone: revChange >= 0 ? 'success' : 'danger',
        },
        {
            title: 'Đơn hàng',
            value: totalOrd,
            meta: 'Tổng đơn đã ghi nhận',
            icon: <ShoppingBagOutlinedIcon />,
            tone: 'accent',
        },
        {
            title: 'Người dùng',
            value: totalUsr,
            meta: 'Tài khoản khách hàng',
            icon: <GroupOutlinedIcon />,
            tone: 'warning',
        },
        {
            title: 'Sản phẩm',
            value: totalProd,
            meta: 'Sản phẩm đang quản lý',
            icon: <Inventory2OutlinedIcon />,
            tone: 'neutral',
        },
    ];

    return (
        <section className="admin-kpi-grid">
            {cards.map((card) => (
                <article className="admin-kpi-card" key={card.title}>
                    <div className={`admin-kpi-icon ${card.tone}`}>{card.icon}</div>
                    <div className="admin-kpi-content">
                        <span>{card.title}</span>
                        <strong>{card.value}</strong>
                        <small className={card.tone}>{card.meta}</small>
                    </div>
                </article>
            ))}
        </section>
    );
}
