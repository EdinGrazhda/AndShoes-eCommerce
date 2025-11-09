import {
    Calendar,
    CheckCircle,
    CreditCard,
    Home,
    Mail,
    Package,
    Phone,
    X,
} from 'lucide-react';
import { memo } from 'react';

interface Order {
    id: number;
    unique_id: string;
    customer_full_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    customer_country: 'albania' | 'kosovo' | 'macedonia';
    product_name: string;
    product_price: number;
    product_image?: string;
    product_size?: string;
    product_color?: string;
    quantity: number;
    total_amount: number;
    payment_method: 'cash';
    status: string;
    created_at?: string;
}

interface OrderSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export const OrderSuccessModal = memo(
    ({ isOpen, onClose, order }: OrderSuccessModalProps) => {
        if (!isOpen || !order) return null;

        const formatPrice = (price: number | string): string => {
            const numPrice =
                typeof price === 'string' ? parseFloat(price) : price;
            return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
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

        const formatDate = (dateString: string) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        };

        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div
                            className="shrink-0 border-b border-gray-200 px-6 py-4"
                            style={{ backgroundColor: '#771f48' }}
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">
                                    Order Confirmation
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Success Header */}
                            <div className="mb-6 text-center">
                                <div className="mb-4 flex justify-center">
                                    <div
                                        className="rounded-full p-4 shadow-xl"
                                        style={{ backgroundColor: '#771f48' }}
                                    >
                                        <CheckCircle className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                    Order Placed Successfully!
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Thank you for your order. We'll be in touch
                                    with you soon.
                                </p>
                                <div
                                    className="mt-4 rounded-xl border-2 p-4"
                                    style={{
                                        borderColor: '#771f48',
                                        backgroundColor:
                                            'rgba(119, 31, 72, 0.05)',
                                    }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Package
                                            className="h-5 w-5"
                                            style={{ color: '#771f48' }}
                                        />
                                        <span
                                            className="text-base font-semibold"
                                            style={{ color: '#771f48' }}
                                        >
                                            Order ID: {order.unique_id}
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-700">
                                        Keep this order ID for your records. You
                                        can use it to track your order.
                                    </p>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="mb-6">
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
                                    <div
                                        className="border-b border-gray-100 px-4 py-3"
                                        style={{
                                            background:
                                                'linear-gradient(to right, rgba(119, 31, 72, 0.05), rgba(119, 31, 72, 0.1))',
                                        }}
                                    >
                                        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                                            <Home
                                                className="h-4 w-4"
                                                style={{ color: '#771f48' }}
                                            />
                                            Delivery Information
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                                        <div className="flex items-start gap-2.5">
                                            <div
                                                className="rounded-lg p-1.5"
                                                style={{
                                                    backgroundColor:
                                                        'rgba(119, 31, 72, 0.1)',
                                                }}
                                            >
                                                <Package
                                                    className="h-3.5 w-3.5"
                                                    style={{ color: '#771f48' }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-semibold text-gray-700">
                                                    Customer Name
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {order.customer_full_name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div
                                                className="rounded-lg p-1.5"
                                                style={{
                                                    backgroundColor:
                                                        'rgba(119, 31, 72, 0.1)',
                                                }}
                                            >
                                                <Mail
                                                    className="h-3.5 w-3.5"
                                                    style={{ color: '#771f48' }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-semibold text-gray-700">
                                                    Email Address
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {order.customer_email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div
                                                className="rounded-lg p-1.5"
                                                style={{
                                                    backgroundColor:
                                                        'rgba(119, 31, 72, 0.1)',
                                                }}
                                            >
                                                <Phone
                                                    className="h-3.5 w-3.5"
                                                    style={{ color: '#771f48' }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-semibold text-gray-700">
                                                    Phone Number
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {order.customer_phone}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5 md:col-span-3">
                                            <div
                                                className="rounded-lg p-1.5"
                                                style={{
                                                    backgroundColor:
                                                        'rgba(119, 31, 72, 0.1)',
                                                }}
                                            >
                                                <Home
                                                    className="h-3.5 w-3.5"
                                                    style={{ color: '#771f48' }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-semibold text-gray-700">
                                                    Delivery Address
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {order.customer_address}
                                                    <br />
                                                    {order.customer_city},{' '}
                                                    {getCountryLabel(
                                                        order.customer_country,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="mb-6">
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
                                    <div
                                        className="border-b border-gray-100 px-4 py-3"
                                        style={{
                                            background:
                                                'linear-gradient(to right, rgba(119, 31, 72, 0.05), rgba(119, 31, 72, 0.15))',
                                        }}
                                    >
                                        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                                            <Package
                                                className="h-4 w-4"
                                                style={{ color: '#771f48' }}
                                            />
                                            Order Details (1 Item)
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        <div className="p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="text-xs font-semibold text-gray-600">
                                                    Order #{order.unique_id}
                                                </div>
                                                <div
                                                    className="text-sm font-bold"
                                                    style={{
                                                        color: '#771f48',
                                                    }}
                                                >
                                                    €
                                                    {formatPrice(
                                                        order.total_amount,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                {order.product_image ? (
                                                    <img
                                                        src={
                                                            order.product_image
                                                        }
                                                        alt={order.product_name}
                                                        className="h-16 w-16 rounded-lg object-cover shadow-md"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 shadow-md">
                                                        <Package className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-gray-900">
                                                        {order.product_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        €
                                                        {formatPrice(
                                                            order.product_price,
                                                        )}{' '}
                                                        × {order.quantity}
                                                    </p>
                                                    <div className="mt-1 flex gap-4 text-xs text-gray-600">
                                                        {order.product_size && (
                                                            <span>
                                                                Size:{' '}
                                                                {
                                                                    order.product_size
                                                                }
                                                            </span>
                                                        )}
                                                        {order.product_color && (
                                                            <span>
                                                                Color:{' '}
                                                                {
                                                                    order.product_color
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-md">
                                <div
                                    className="border-b border-gray-100 px-4 py-3"
                                    style={{
                                        background:
                                            'linear-gradient(to right, rgba(119, 31, 72, 0.05), rgba(119, 31, 72, 0.1))',
                                    }}
                                >
                                    <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                                        <CreditCard
                                            className="h-4 w-4"
                                            style={{ color: '#771f48' }}
                                        />
                                        Total Summary
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-2 rounded-xl bg-gray-50 p-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Items ({order.quantity}):
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                €
                                                {formatPrice(
                                                    order.product_price *
                                                        order.quantity,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Shipping:
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                €
                                                {formatPrice(
                                                    order.total_amount -
                                                        order.product_price *
                                                            order.quantity,
                                                )}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-300 pt-2">
                                            <div className="flex justify-between text-lg">
                                                <span className="font-bold text-gray-900">
                                                    Total Amount:
                                                </span>
                                                <span
                                                    className="font-bold"
                                                    style={{ color: '#771f48' }}
                                                >
                                                    €
                                                    {formatPrice(
                                                        order.total_amount,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                            <CreditCard className="h-4 w-4" />
                                            <span>
                                                Payment Method: Cash on Delivery
                                                (COD)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="rounded-xl bg-blue-50 p-4">
                                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-900">
                                    <Calendar className="h-4 w-4" />
                                    What's Next?
                                </h4>
                                <ul className="space-y-1 text-xs text-blue-800">
                                    <li>
                                        • We'll contact you within 24 hours to
                                        confirm your order
                                    </li>
                                    <li>
                                        • Your order will be prepared and
                                        shipped
                                    </li>
                                    <li>
                                        • You'll receive tracking information
                                        via email
                                    </li>
                                    <li>
                                        • Payment will be collected upon
                                        delivery
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-600">
                                    Need help? Contact us at
                                    info@andshoes-ks.com
                                </p>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg bg-pink-800 px-6 py-2 text-sm font-medium text-white hover:bg-pink-900 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    },
);

OrderSuccessModal.displayName = 'OrderSuccessModal';
