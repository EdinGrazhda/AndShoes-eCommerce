import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    CreditCard,
    Edit2,
    Eye,
    Filter,
    Hash,
    Package,
    Search,
    ShoppingCart,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/admin/orders',
    },
];

interface Product {
    id: number;
    name: string;
    price: number;
    image?: string;
}

interface Order {
    id: number;
    unique_id: string;
    customer_full_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    customer_country: 'albania' | 'kosovo' | 'macedonia';
    product_id: number;
    product_name: string;
    product_price: number;
    product_image?: string;
    product_size?: string;
    product_color?: string;
    quantity: number;
    total_amount: number;
    payment_method: 'cash';
    status:
        | 'pending'
        | 'confirmed'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'cancelled';
    notes?: string;
    confirmed_at?: string;
    shipped_at?: string;
    delivered_at?: string;
    created_at?: string;
    updated_at?: string;
    product?: Product;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface Filters {
    search?: string;
    status?: string;
    country?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: string;
}

interface OrdersPageProps {
    orders: Order[];
    pagination?: Pagination;
    filters?: Filters;
}

export default function Orders({
    orders = [],
    pagination,
    filters = {},
}: OrdersPageProps) {
    // Debug logging
    console.log('Orders component received:', {
        orders,
        pagination,
        filters,
        ordersLength: orders.length,
        ordersType: typeof orders,
        ordersIsArray: Array.isArray(orders),
    });

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedCountry, setSelectedCountry] = useState(
        filters.country || '',
    );

    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    // Real-time filtering with debounce
    const getCurrentFilters = useCallback(() => {
        const filterParams: any = {};
        if (searchTerm) filterParams.search = searchTerm;
        if (selectedStatus) filterParams.status = selectedStatus;
        if (selectedCountry) filterParams.country = selectedCountry;
        return filterParams;
    }, [searchTerm, selectedStatus, selectedCountry]);

    const applyFilters = useCallback(() => {
        router.get('/admin/orders', getCurrentFilters(), {
            preserveState: true,
            preserveScroll: true,
        });
    }, [getCurrentFilters]);

    // Debounced filtering effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            applyFilters();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [applyFilters]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedCountry('');
    };

    // CRUD Functions
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const handleEditOrder = (order: Order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setShowEditModal(true);
    };

    const handleDeleteOrder = (order: Order) => {
        setSelectedOrder(order);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedOrder) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/orders/${selectedOrder.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setShowDeleteModal(false);
                setSelectedOrder(null);
                toast.success('Order deleted successfully!');
                router.reload();
            } else {
                const data = await response.json();
                const errorMessage = data.message || 'Failed to delete order';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Network error occurred while deleting the order');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/orders/${selectedOrder.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    status: newStatus,
                    notes: selectedOrder.notes,
                }),
            });

            if (response.ok) {
                setShowEditModal(false);
                setSelectedOrder(null);
                toast.success('Order status updated successfully!');
                router.reload();
            } else {
                const data = await response.json();
                const errorMessage =
                    data.message || 'Failed to update order status';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Network error occurred while updating the order');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-purple-100 text-purple-800';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCountryLabel = (country: string) => {
        switch (country) {
            case 'albania':
                return 'Albania';
            case 'kosovo':
                return 'Kosovo';
            case 'macedonia':
                return 'Macedonia';
            default:
                return country;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            {/* Main Container */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
                <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3 shadow-lg">
                                    <ShoppingCart className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
                                        Orders
                                    </h1>
                                    <p className="mt-2 text-lg text-gray-600">
                                        Manage and track customer orders
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Smart Filters Section */}
                    <div className="mb-10 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3 shadow-lg">
                                        <Filter className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Smart Filters
                                    </h3>
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:scale-105 hover:bg-gray-200 hover:text-gray-900"
                                >
                                    <X className="h-4 w-4" />
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Search */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold tracking-wide text-gray-700">
                                        Search Orders
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            placeholder="Order ID, Customer..."
                                            className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 py-4 pr-4 pl-12 text-sm font-medium transition-all duration-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold tracking-wide text-gray-700">
                                        Order Status
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 px-4 py-4 text-sm font-medium transition-all duration-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:outline-none"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">
                                            Confirmed
                                        </option>
                                        <option value="processing">
                                            Processing
                                        </option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">
                                            Delivered
                                        </option>
                                        <option value="cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>

                                {/* Country Filter */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold tracking-wide text-gray-700">
                                        Country
                                    </label>
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) =>
                                            setSelectedCountry(e.target.value)
                                        }
                                        className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 px-4 py-4 text-sm font-medium transition-all duration-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:outline-none"
                                    >
                                        <option value="">All Countries</option>
                                        <option value="albania">Albania</option>
                                        <option value="kosovo">Kosovo</option>
                                        <option value="macedonia">
                                            Macedonia
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table Section */}
                    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 p-3 shadow-lg">
                                        <ShoppingCart className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Orders List (
                                        {pagination?.total || orders.length}{' '}
                                        orders)
                                    </h3>
                                </div>
                                <div className="text-sm font-medium text-gray-600">
                                    Showing {pagination?.from || 0} to{' '}
                                    {pagination?.to || 0} of{' '}
                                    {pagination?.total || orders.length} orders
                                </div>
                            </div>
                        </div>

                        {orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Order ID
                                            </th>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Customer
                                            </th>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Product
                                            </th>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Total
                                            </th>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Status
                                            </th>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Date
                                            </th>
                                            <th className="px-8 py-6 text-right text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {orders.map((order, index) => (
                                            <tr
                                                key={order.id}
                                                className={`transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:shadow-lg ${
                                                    index % 2 === 0
                                                        ? 'bg-white'
                                                        : 'bg-gray-50/30'
                                                }`}
                                            >
                                                {/* Order ID */}
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 p-2">
                                                            <Hash className="h-4 w-4 text-emerald-600" />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {order.unique_id}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 p-2">
                                                            <User className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900">
                                                                {
                                                                    order.customer_full_name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {
                                                                    order.customer_email
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Product */}
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        {order.product_image ? (
                                                            <img
                                                                src={
                                                                    order.product_image
                                                                }
                                                                alt={
                                                                    order.product_name
                                                                }
                                                                className="h-12 w-12 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                                                <Package className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {
                                                                    order.product_name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Qty:{' '}
                                                                {order.quantity}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Total */}
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="text-lg font-bold text-emerald-600">
                                                        $
                                                        {formatPrice(
                                                            order.total_amount,
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
                                                    >
                                                        {order.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            order.status.slice(
                                                                1,
                                                            )}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        {order.created_at
                                                            ? formatDate(
                                                                  order.created_at,
                                                              )
                                                            : 'Unknown'}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-8 py-6 text-right text-sm font-medium whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    order,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleEditOrder(
                                                                    order,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-purple-600 hover:to-violet-700 focus:ring-4 focus:ring-purple-300 focus:outline-none"
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteOrder(
                                                                    order,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 focus:outline-none"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-6 rounded-full bg-gray-100 p-6">
                                    <ShoppingCart className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900">
                                    No orders found
                                </h3>
                                <p className="mb-8 max-w-md text-gray-600">
                                    {Object.keys(filters).length > 0
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Orders will appear here once customers start making purchases.'}
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.last_page > 1 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-700">
                                        Showing {pagination.from || 0} to{' '}
                                        {pagination.to || 0} of{' '}
                                        {pagination.total || 0} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pagination.current_page > 1 && (
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/orders',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page:
                                                                pagination.current_page -
                                                                1,
                                                        },
                                                    )
                                                }
                                                className="relative inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                        )}

                                        {Array.from(
                                            { length: pagination.last_page },
                                            (_, i) => i + 1,
                                        ).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/orders',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page,
                                                        },
                                                    )
                                                }
                                                className={`relative inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                                    page ===
                                                    pagination.current_page
                                                        ? 'scale-105 border-emerald-500 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        {pagination.current_page <
                                            pagination.last_page && (
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/orders',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page:
                                                                pagination.current_page +
                                                                1,
                                                        },
                                                    )
                                                }
                                                className="relative inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
                            <h3 className="text-2xl font-bold text-white">
                                Order Details - {selectedOrder.unique_id}
                            </h3>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto p-8">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                {/* Customer Information */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                        <User className="h-5 w-5 text-emerald-600" />
                                        Customer Information
                                    </h4>
                                    <div className="space-y-3 rounded-2xl bg-gray-50 p-6">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Full Name
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {
                                                    selectedOrder.customer_full_name
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Email
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedOrder.customer_email}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Phone
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedOrder.customer_phone}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Address
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedOrder.customer_address}
                                                <br />
                                                {
                                                    selectedOrder.customer_city
                                                },{' '}
                                                {getCountryLabel(
                                                    selectedOrder.customer_country,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Information */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                        <Package className="h-5 w-5 text-emerald-600" />
                                        Product Information
                                    </h4>
                                    <div className="space-y-3 rounded-2xl bg-gray-50 p-6">
                                        {selectedOrder.product_image && (
                                            <img
                                                src={
                                                    selectedOrder.product_image
                                                }
                                                alt={selectedOrder.product_name}
                                                className="h-32 w-32 rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Product Name
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedOrder.product_name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Price
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                $
                                                {formatPrice(
                                                    selectedOrder.product_price,
                                                )}
                                            </p>
                                        </div>
                                        {selectedOrder.product_size && (
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">
                                                    Size
                                                </label>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {selectedOrder.product_size}
                                                </p>
                                            </div>
                                        )}
                                        {selectedOrder.product_color && (
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">
                                                    Color
                                                </label>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {
                                                        selectedOrder.product_color
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Quantity
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedOrder.quantity}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Total Amount
                                            </label>
                                            <p className="text-lg font-bold text-emerald-600">
                                                $
                                                {formatPrice(
                                                    selectedOrder.total_amount,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Status */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                        <CreditCard className="h-5 w-5 text-emerald-600" />
                                        Order Status
                                    </h4>
                                    <div className="space-y-3 rounded-2xl bg-gray-50 p-6">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Status
                                            </label>
                                            <p className="mt-1">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}
                                                >
                                                    {selectedOrder.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        selectedOrder.status.slice(
                                                            1,
                                                        )}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Payment Method
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                Cash on Delivery
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Order Date
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedOrder.created_at
                                                    ? formatDate(
                                                          selectedOrder.created_at,
                                                      )
                                                    : 'Unknown'}
                                            </p>
                                        </div>
                                        {selectedOrder.notes && (
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">
                                                    Notes
                                                </label>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {selectedOrder.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 bg-gray-50 px-8 py-6">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedOrder(null);
                                }}
                                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:from-emerald-600 hover:to-teal-700 focus:ring-4 focus:ring-emerald-300 focus:outline-none"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Modal */}
            {showEditModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                        <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-8 py-6">
                            <h3 className="text-xl font-bold text-white">
                                Update Order Status
                            </h3>
                        </div>
                        <div className="p-8">
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Order: {selectedOrder.unique_id}
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) =>
                                        setNewStatus(e.target.value)
                                    }
                                    className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 px-4 py-4 text-sm font-medium transition-all duration-300 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100 focus:outline-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">
                                        Processing
                                    </option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 rounded-2xl border-2 border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={isLoading}
                                    className="flex-1 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:from-purple-600 hover:to-violet-700 focus:ring-4 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading
                                        ? 'Updating...'
                                        : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-8 py-6">
                            <h3 className="text-xl font-bold text-white">
                                Confirm Deletion
                            </h3>
                        </div>
                        <div className="p-8">
                            <div className="mb-8 flex items-center gap-4">
                                <div className="rounded-full bg-red-100 p-4">
                                    <ShoppingCart className="h-8 w-8 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        Delete Order "{selectedOrder.unique_id}
                                        "?
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This action cannot be undone. The order
                                        will be permanently removed.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 rounded-2xl border-2 border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isLoading}
                                    className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading ? 'Deleting...' : 'Delete Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
