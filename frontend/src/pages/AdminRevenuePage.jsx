import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { adminOrderApi, adminUserApi } from '../services/api'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import '../styles/pages/AdminRevenue.css'

const COLORS = ['#059669', '#f59e0b', '#3b82f6', '#ef4444']
const STATUS_LABELS = {
    CHO_XAC_NHAN: 'Chờ xác nhận',
    DA_XAC_NHAN_DANG_CHUAN_BI: 'Đang chuẩn bị',
    GIAO_HANG_THANH_CONG: 'Đã giao',
    DA_HUY: 'Đã hủy'
}

function AdminRevenuePage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [userStats, setUserStats] = useState(null)
    const [timeRange, setTimeRange] = useState('30')
    const [showExport, setShowExport] = useState(false)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
            navigate('/dang-nhap')
            return
        }
        const user = JSON.parse(storedUser)
        if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
            navigate('/')
            return
        }
    }, [navigate])

    useEffect(() => {
        loadStats()
    }, [timeRange])

    const loadStats = async () => {
        setLoading(true)
        try {
            const endDate = new Date()
            const startDate = new Date()
            if (timeRange === '1') {
                startDate.setDate(startDate.getDate() - 1)
            } else if (timeRange === '7') {
                startDate.setDate(startDate.getDate() - 7)
            } else {
                startDate.setDate(startDate.getDate() - 30)
            }

            const [orderStatsRes, userStatsRes] = await Promise.all([
                adminOrderApi.getStats(
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0]
                ),
                adminUserApi.getStats()
            ])

            setStats(orderStatsRes.data)
            setUserStats(userStatsRes.data)
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price) => {
        if (!price && price !== 0) return '0đ'
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
    }

    const formatShortPrice = (price) => {
        if (!price && price !== 0) return '0'
        if (price >= 1000000) {
            return (price / 1000000).toFixed(1) + 'M'
        }
        if (price >= 1000) {
            return (price / 1000).toFixed(0) + 'K'
        }
        return price.toString()
    }

    const getTimeRangeLabel = () => {
        if (timeRange === '1') return 'Hôm nay'
        if (timeRange === '7') return '7 ngày qua'
        return '30 ngày qua'
    }

    const handleExport = (format) => {
        // Create export data
        const exportData = {
            period: getTimeRangeLabel(),
            revenue: stats?.totalRevenue || 0,
            orders: stats?.totalOrders || 0,
            avgOrderValue: stats?.avgOrderValue || 0,
            completionRate: stats?.completionRate || 0,
            exportedAt: new Date().toLocaleString('vi-VN')
        }

        if (format === 'csv') {
            const csv = `Báo cáo Doanh thu - ${exportData.period}
Thời gian xuất: ${exportData.exportedAt}

Tổng doanh thu,${exportData.revenue}
Tổng đơn hàng,${exportData.orders}
Giá trị trung bình,${exportData.avgOrderValue}
Tỷ lệ hoàn tất,${exportData.completionRate}%`

            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `doanh-thu-${new Date().toISOString().split('T')[0]}.csv`
            link.click()
        }

        setShowExport(false)
    }

    // Prepare chart data
    const chartData = stats?.revenueByDate?.map(item => ({
        date: item.date?.split('-').slice(1).join('/'),
        revenue: Number(item.revenue) || 0,
        orders: item.orders || 0
    })) || []

    const pieData = stats?.revenueByStatus?.filter(s => s.count > 0).map((item, index) => ({
        name: STATUS_LABELS[item.status] || item.status,
        value: item.count,
        color: COLORS[index % COLORS.length]
    })) || []

    if (loading && !stats) {
        return (
            <div className="admin-page revenue-page">
                <div className="admin-container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-page revenue-page">
            <div className="admin-container">
                {/* Header */}
                <motion.div
                    className="revenue-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-left">
                        <h1>Dashboard – Tổng quan</h1>
                        <p>Thống kê doanh thu và đơn hàng</p>
                    </div>
                    <div className="header-right">
                        <div className="time-filter">
                            <button
                                className={timeRange === '1' ? 'active' : ''}
                                onClick={() => setTimeRange('1')}
                            >
                                Hôm nay
                            </button>
                            <button
                                className={timeRange === '7' ? 'active' : ''}
                                onClick={() => setTimeRange('7')}
                            >
                                7 ngày
                            </button>
                            <button
                                className={timeRange === '30' ? 'active' : ''}
                                onClick={() => setTimeRange('30')}
                            >
                                30 ngày
                            </button>
                        </div>
                        <button className="btn-export" onClick={() => setShowExport(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Export Report
                        </button>
                    </div>
                </motion.div>

                {/* KPI Cards - Row A */}
                <motion.div
                    className="kpi-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="kpi-card revenue">
                        <div className="kpi-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Doanh thu</span>
                            <span className="kpi-value">{formatPrice(stats?.totalRevenue)}</span>
                            <span className="kpi-period">{getTimeRangeLabel()}</span>
                        </div>
                    </div>

                    <div className="kpi-card orders">
                        <div className="kpi-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                            </svg>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Số đơn hàng</span>
                            <span className="kpi-value">{stats?.totalOrders || 0}</span>
                            <span className="kpi-sub">
                                <span className="completed">{stats?.completedOrders || 0} hoàn tất</span>
                                {stats?.pendingOrders > 0 && <span className="pending"> · {stats.pendingOrders} chờ</span>}
                            </span>
                        </div>
                    </div>

                    <div className="kpi-card aov">
                        <div className="kpi-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Giá trị trung bình</span>
                            <span className="kpi-value">{formatPrice(stats?.avgOrderValue)}</span>
                            <span className="kpi-period">AOV</span>
                        </div>
                    </div>

                    <div className="kpi-card completion">
                        <div className="kpi-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Tỷ lệ hoàn tất</span>
                            <span className="kpi-value">{stats?.completionRate || 0}%</span>
                            <span className="kpi-sub">
                                {stats?.rejectedOrders > 0 &&
                                    <span className="rejected">{stats.rejectedOrders} đơn hủy</span>
                                }
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Charts Row - Row B (8:4 layout) */}
                <motion.div
                    className="charts-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Revenue Chart - 8 columns */}
                    <div className="chart-card main-chart">
                        <div className="chart-header-enhanced">
                            <h3>Doanh thu theo thời gian</h3>
                            <div className="chart-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Tổng {getTimeRangeLabel()}:</span>
                                    <span className="summary-value">{formatPrice(stats?.totalRevenue)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">TB/ngày:</span>
                                    <span className="summary-value">
                                        {formatPrice(chartData.length > 0 ? Math.round((stats?.totalRevenue || 0) / chartData.length) : 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="chart-container">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" strokeOpacity={0.6} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9CA3AF"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#9CA3AF"
                                            fontSize={11}
                                            tickFormatter={formatShortPrice}
                                            tickLine={false}
                                            axisLine={false}
                                            width={50}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="custom-tooltip">
                                                            <p className="tooltip-date">Ngày: {label}</p>
                                                            <p className="tooltip-revenue">Doanh thu: {formatPrice(payload[0].value)}</p>
                                                            <p className="tooltip-orders">Số đơn: {payload[0].payload.orders}</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#059669"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
                                            activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="no-data">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M3 3v18h18" />
                                        <path d="M18 17l-5-8-4 4-3-3" />
                                    </svg>
                                    <p>Chưa có dữ liệu trong khoảng thời gian này</p>
                                </div>
                            )}
                        </div>
                        {/* Mini Stats */}
                        {chartData.length > 0 && (
                            <div className="chart-mini-stats">
                                <div className="mini-stat high">
                                    <span className="mini-label">📈 Cao nhất:</span>
                                    <span className="mini-value">
                                        {(() => {
                                            const max = chartData.reduce((a, b) => a.revenue > b.revenue ? a : b, { revenue: 0, date: '' })
                                            return `${max.date} – ${formatPrice(max.revenue)}`
                                        })()}
                                    </span>
                                </div>
                                <div className="mini-stat low">
                                    <span className="mini-label">📉 Thấp nhất:</span>
                                    <span className="mini-value">
                                        {(() => {
                                            const min = chartData.reduce((a, b) => a.revenue < b.revenue ? a : b, { revenue: Infinity, date: '' })
                                            return `${min.date} – ${formatPrice(min.revenue)}`
                                        })()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Donut Chart - 4 columns */}
                    <div className="chart-card breakdown-chart">
                        <div className="chart-header">
                            <h3>Cơ cấu đơn hàng</h3>
                        </div>
                        <div className="chart-container donut-layout">
                            {stats?.totalOrders > 0 ? (
                                <>
                                    <div className="donut-wrapper">
                                        <ResponsiveContainer width="100%" height={180}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={75}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value, name) => [`${value} đơn (${Math.round(value / stats.totalOrders * 100)}%)`, name]}
                                                    contentStyle={{
                                                        background: '#fff',
                                                        border: '1px solid #E8DFD0',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        padding: '8px 12px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center Label */}
                                        <div className="donut-center">
                                            <span className="center-value">{stats?.totalOrders || 0}</span>
                                            <span className="center-label">Tổng đơn</span>
                                        </div>
                                    </div>
                                    {/* Custom Legend */}
                                    <div className="donut-legend">
                                        {stats?.revenueByStatus?.map((item, index) => {
                                            const percent = stats.totalOrders > 0 ? Math.round(item.count / stats.totalOrders * 100) : 0
                                            return (
                                                <div className="legend-item" key={item.status}>
                                                    <span
                                                        className="legend-dot"
                                                        style={{ background: COLORS[index % COLORS.length] }}
                                                    />
                                                    <span className="legend-text">
                                                        {STATUS_LABELS[item.status]} — {item.count} đơn ({percent}%)
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="no-data">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 2a10 10 0 0 1 10 10" />
                                    </svg>
                                    <p>Chưa có dữ liệu</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* User Analytics - Row C */}
                <motion.div
                    className="user-analytics-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="analytics-card">
                        <div className="analytics-header">
                            <h3>Thống kê người dùng</h3>
                        </div>
                        <div className="analytics-content user-overview">
                            <div className="stat-item">
                                <span className="stat-value">{userStats?.total || 0}</span>
                                <span className="stat-label">Tổng người dùng</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{userStats?.users || 0}</span>
                                <span className="stat-label">Khách hàng</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{userStats?.managers || 0}</span>
                                <span className="stat-label">Quản lý</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{userStats?.admins || 0}</span>
                                <span className="stat-label">Admin</span>
                            </div>
                        </div>
                    </div>

                    <div className="analytics-card">
                        <div className="analytics-header">
                            <h3>Phương thức thanh toán</h3>
                        </div>
                        <div className="analytics-content payment-breakdown">
                            {stats?.revenueByPaymentMethod?.map((pm, index) => (
                                <div className="payment-item" key={pm.method}>
                                    <div className="payment-info">
                                        <span className="payment-method">{pm.method === 'COD' ? 'Thanh toán COD' : 'Chuyển khoản'}</span>
                                        <span className="payment-count">{pm.count} đơn</span>
                                    </div>
                                    <div className="payment-bar">
                                        <div
                                            className="payment-fill"
                                            style={{
                                                width: `${stats.totalOrders > 0 ? (pm.count / stats.totalOrders * 100) : 0}%`,
                                                background: index === 0 ? '#059669' : '#3b82f6'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Export Modal */}
                <AnimatePresence>
                    {showExport && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowExport(false)}
                        >
                            <motion.div
                                className="modal-content export-modal"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="modal-header">
                                    <h2>Export Report</h2>
                                    <button className="close-btn" onClick={() => setShowExport(false)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p className="export-info">
                                        Xuất báo cáo doanh thu cho khoảng thời gian: <strong>{getTimeRangeLabel()}</strong>
                                    </p>
                                    <div className="export-options">
                                        <button className="export-option" onClick={() => handleExport('csv')}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                <line x1="16" y1="17" x2="8" y2="17" />
                                            </svg>
                                            <span>Excel (CSV)</span>
                                        </button>
                                    </div>
                                    <p className="export-note">
                                        Báo cáo sẽ bao gồm: Doanh thu, số đơn hàng, giá trị trung bình, tỉ lệ hoàn tất.
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default AdminRevenuePage
