import React, { useState, useMemo } from 'react';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import formatVND from '@/shared/utils/formatCurrency.js';

const FILTERS = ['Tuần', 'Tháng', 'Năm'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="admin-chart-tooltip">
        <span>{label}</span>
        <strong>{formatVND(payload[0].value)}</strong>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ analyticsData, loading }) {
    const [filter, setFilter] = useState('Tuần');

    const data = useMemo(() => {
        if (!analyticsData) return [];

        const source = {
            'Tuần': analyticsData.week || [],
            'Tháng': analyticsData.month || [],
            'Năm': analyticsData.year || []
        };

        return source[filter].map(item => ({
            name: item.label,
            amount: item.amount
        }));
    }, [filter, analyticsData]);

    const isEmpty = useMemo(() => {
        return !loading && (!data || data.length === 0 || data.every(d => d.amount === 0));
    }, [data, loading]);

    return (
        <section className="admin-chart-card">
            <div className="admin-chart-header">
                <div>
                    <h3>Phân tích doanh thu</h3>
                    <p>Dữ liệu đơn hàng thực tế theo thời gian</p>
                </div>

                <div className="admin-chart-filter" aria-label="Bộ lọc biểu đồ">
                    {FILTERS.map(mode => (
                        <button
                            type="button"
                            key={mode}
                            onClick={() => setFilter(mode)}
                            className={filter === mode ? 'active' : ''}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-chart-area">
                {loading && (
                    <div className="admin-chart-loading">
                        <div className="admin-spinner" />
                        <span>Đang đồng bộ dữ liệu</span>
                    </div>
                )}

                {isEmpty ? (
                    <div className="admin-chart-empty">
                        <QueryStatsOutlinedIcon />
                        <h4>Chưa có dữ liệu</h4>
                        <p>Hệ thống chưa ghi nhận doanh thu cho bộ lọc {filter.toLowerCase()} này.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'Inter' }}
                                dy={14}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: '#e85d75', opacity: 0.06 }}
                            />
                            <Bar
                                dataKey="amount"
                                fill="#e85d75"
                                radius={[8, 8, 0, 0]}
                                barSize={filter === 'Năm' ? 24 : 34}
                                animationDuration={700}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </section>
    );
}
