import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { adminUserApi } from '../services/api'
import '../styles/pages/AdminPage.css'

function AdminAccountsPage() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState({ type: '', text: '' })

    // Search & Filter
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')

    // Pagination
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const pageSize = 6

    // Modal
    const [showRoleModal, setShowRoleModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [newRole, setNewRole] = useState('')
    const [saving, setSaving] = useState(false)

    // Auth check
    useEffect(() => {
        const userStr = localStorage.getItem('user')
        if (!userStr) {
            navigate('/dang-nhap')
            return
        }
        const user = JSON.parse(userStr)
        if (user.role !== 'ADMIN') {
            navigate('/')
            return
        }
    }, [navigate])

    // Load users
    const loadUsers = useCallback(async () => {
        setLoading(true)
        try {
            const res = await adminUserApi.getAll(search, roleFilter, currentPage, pageSize)
            setUsers(res.data.users || [])
            setTotalPages(res.data.totalPages || 0)
            setTotalItems(res.data.totalItems || 0)
        } catch (e) {
            console.error(e)
            setMessage({ type: 'error', text: 'Không tải được danh sách tài khoản' })
        } finally {
            setLoading(false)
        }
    }, [search, roleFilter, currentPage])

    useEffect(() => {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            const user = JSON.parse(userStr)
            if (user.role === 'ADMIN') {
                loadUsers()
            }
        }
    }, [loadUsers])

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(0)
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    // Open role modal
    const openRoleModal = (user) => {
        setSelectedUser(user)
        setNewRole(user.role)
        setShowRoleModal(true)
    }

    // Save role change
    const handleSaveRole = async () => {
        if (!selectedUser || !newRole) return

        setSaving(true)
        try {
            await adminUserApi.updateRole(selectedUser.id, newRole)
            setMessage({ type: 'success', text: `Đã cập nhật quyền cho ${selectedUser.fullName}` })
            setShowRoleModal(false)
            loadUsers()
        } catch (e) {
            console.error(e)
            setMessage({ type: 'error', text: e.response?.data?.message || 'Cập nhật quyền thất bại' })
        } finally {
            setSaving(false)
        }
    }

    // Delete user
    const handleDelete = async (user) => {
        if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${user.fullName}"?`)) return

        try {
            await adminUserApi.delete(user.id)
            setMessage({ type: 'success', text: 'Đã xóa tài khoản' })
            loadUsers()
        } catch (e) {
            console.error(e)
            setMessage({ type: 'error', text: e.response?.data?.message || 'Xóa tài khoản thất bại' })
        }
    }

    // Role badge styling
    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'ADMIN': return 'active'
            case 'MANAGER': return 'manager'
            case 'USER': return 'inactive'
            default: return 'inactive'
        }
    }

    const getRoleLabel = (role) => {
        switch (role) {
            case 'ADMIN': return 'Admin'
            case 'MANAGER': return 'Quản lý'
            case 'USER': return 'Khách hàng'
            default: return role
        }
    }

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                {/* Header */}
                <div className="admin-header">
                    <div className="admin-title">
                        <h1>Quản lý tài khoản</h1>
                        <p>Tìm kiếm, phân quyền và quản lý người dùng ({totalItems} tài khoản)</p>
                    </div>
                    <button className="btn-add" onClick={loadUsers} disabled={loading}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                        </svg>
                        Làm mới
                    </button>
                </div>

                {/* Alert message */}
                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {message.type === 'success' ? (
                                <polyline points="20 6 9 17 4 12" />
                            ) : (
                                <>
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </>
                            )}
                        </svg>
                        {message.text}
                    </div>
                )}

                {/* Search & Filter */}
                <div className="admin-filters" style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                background: 'white'
                            }}
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value)
                            setCurrentPage(0)
                        }}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '2px solid var(--color-border)',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            background: 'white',
                            minWidth: '150px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Tất cả quyền</option>
                        <option value="USER">Khách hàng</option>
                        <option value="MANAGER">Quản lý</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                {/* Table */}
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Điện thoại</th>
                                <th>Quyền</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        <div className="empty-content">
                                            <div className="loading-spinner" />
                                            <p>Đang tải dữ liệu...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        <div className="empty-content">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                            </svg>
                                            <p>Không tìm thấy tài khoản nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <td>
                                            <span className="id-badge">{user.id}</span>
                                        </td>
                                        <td>
                                            <div className="product-name">{user.fullName}</div>
                                            {user.provider === 'google' && (
                                                <div className="product-slug">Google Account</div>
                                            )}
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || '-'}</td>
                                        <td>
                                            <span className={`status-badge ${getRoleBadgeClass(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action edit"
                                                    title="Đổi quyền"
                                                    onClick={() => openRoleModal(user)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="btn-action delete"
                                                    title="Xóa"
                                                    onClick={() => handleDelete(user)}
                                                    disabled={user.role === 'ADMIN'}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '1.5rem'
                    }}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: '8px',
                                background: currentPage === 0 ? 'var(--color-bg-alt)' : 'white',
                                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                                opacity: currentPage === 0 ? 0.5 : 1
                            }}
                        >
                            ← Trước
                        </button>

                        <span style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--color-primary)',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: '600'
                        }}>
                            {currentPage + 1} / {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage >= totalPages - 1}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: '8px',
                                background: currentPage >= totalPages - 1 ? 'var(--color-bg-alt)' : 'white',
                                cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                                opacity: currentPage >= totalPages - 1 ? 0.5 : 1
                            }}
                        >
                            Sau →
                        </button>
                    </div>
                )}
            </div>

            {/* Role Modal */}
            <AnimatePresence>
                {showRoleModal && selectedUser && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowRoleModal(false)}
                    >
                        <motion.div
                            className="modal-content modal-small"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Đổi quyền người dùng</h2>
                                <button className="close-btn" onClick={() => setShowRoleModal(false)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="modal-form">
                                <div className="form-group">
                                    <label>Người dùng</label>
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        background: 'var(--color-bg-alt)',
                                        borderRadius: '10px'
                                    }}>
                                        <strong>{selectedUser.fullName}</strong>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                            {selectedUser.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Quyền mới</label>
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: '2px solid var(--color-border)',
                                            borderRadius: '10px',
                                            fontSize: '1rem',
                                            background: 'var(--color-bg)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="USER">Khách hàng (USER)</option>
                                        <option value="MANAGER">Quản lý (MANAGER)</option>
                                        <option value="ADMIN">Admin (ADMIN)</option>
                                    </select>
                                    <span className="form-hint">
                                        {newRole === 'MANAGER' && '• Có quyền quản lý đơn hàng, sản phẩm, xác nhận/từ chối đơn'}
                                        {newRole === 'ADMIN' && '• Toàn quyền quản trị hệ thống'}
                                        {newRole === 'USER' && '• Người dùng thông thường, chỉ xem và đặt hàng'}
                                    </span>
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowRoleModal(false)}>
                                        Hủy
                                    </button>
                                    <button
                                        className="btn-save"
                                        onClick={handleSaveRole}
                                        disabled={saving || newRole === selectedUser.role}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            'Lưu thay đổi'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminAccountsPage
