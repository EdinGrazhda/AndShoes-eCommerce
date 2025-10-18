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
                    <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
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

                            {/* Order Details Cards */}
                            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                                {/* Customer Information */}
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
                                    <div className="space-y-3 p-4">
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
                                                    Email
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
                                                    Phone
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {order.customer_phone}
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

                                {/* Product Information */}
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
                                            Order Summary
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="mb-4 flex items-start gap-3">
                                            {order.product_image ? (
                                                <img
                                                    src={order.product_image}
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
                                                <p
                                                    className="text-base font-semibold"
                                                    style={{ color: '#771f48' }}
                                                >
                                                    €
                                                    {formatPrice(
                                                        order.product_price,
                                                    )}
                                                </p>
                                                <div className="mt-1.5 space-y-0.5 text-xs text-gray-600">
                                                    {order.product_size && (
                                                        <div>
                                                            Size:{' '}
                                                            {order.product_size}
                                                        </div>
                                                    )}
                                                    {order.product_color && (
                                                        <div>
                                                            Color:{' '}
                                                            {
                                                                order.product_color
                                                            }
                                                        </div>
                                                    )}
                                                    <div>
                                                        Quantity:{' '}
                                                        {order.quantity}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 rounded-xl bg-gray-50 p-4">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-600">
                                                    Subtotal:
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    €
                                                    {formatPrice(
                                                        order.product_price *
                                                            order.quantity,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-600">
                                                    Delivery:
                                                </span>
                                                <span className="font-semibold text-green-600">
                                                    FREE
                                                </span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        Total:
                                                    </span>
                                                    <span
                                                        className="text-lg font-bold"
                                                        style={{
                                                            color: '#771f48',
                                                        }}
                                                    >
                                                        €
                                                        {formatPrice(
                                                            order.total_amount,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-3">
                                            <div className="mb-1.5 flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-amber-600" />
                                                <span className="text-sm font-semibold text-amber-900">
                                                    Payment Method
                                                </span>
                                            </div>
                                            <p className="text-xs text-amber-700">
                                                💰 Cash on Delivery - Payment
                                                will be collected when your
                                                order arrives
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Status and Next Steps */}
                            <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
                                <div
                                    className="border-b border-gray-100 px-4 py-3"
                                    style={{
                                        background:
                                            'linear-gradient(to right, rgba(119, 31, 72, 0.05), rgba(119, 31, 72, 0.1))',
                                    }}
                                >
                                    <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                                        <Calendar
                                            className="h-4 w-4"
                                            style={{ color: '#771f48' }}
                                        />
                                        What Happens Next?
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="text-center">
                                            <div className="mb-2 flex justify-center">
                                                <div
                                                    className="rounded-full p-3"
                                                    style={{
                                                        backgroundColor:
                                                            'rgba(119, 31, 72, 0.1)',
                                                    }}
                                                >
                                                    <CheckCircle
                                                        className="h-6 w-6"
                                                        style={{
                                                            color: '#771f48',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900">
                                                Order Confirmed
                                            </h4>
                                            <p className="mt-1.5 text-xs text-gray-600">
                                                We've received your order and
                                                will process it shortly.
                                            </p>
                                            <div
                                                className="mt-1 text-xs font-medium"
                                                style={{ color: '#771f48' }}
                                            >
                                                {order.created_at &&
                                                    formatDate(
                                                        order.created_at,
                                                    )}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="mb-2 flex justify-center">
                                                <div className="rounded-full bg-yellow-100 p-3">
                                                    <Package className="h-6 w-6 text-yellow-600" />
                                                </div>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900">
                                                Processing
                                            </h4>
                                            <p className="mt-1.5 text-xs text-gray-600">
                                                We'll prepare your order and
                                                contact you to confirm delivery
                                                details.
                                            </p>
                                            <div className="mt-1 text-xs font-medium text-yellow-600">
                                                Within 24 hours
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="mb-2 flex justify-center">
                                                <div className="rounded-full bg-green-100 p-3">
                                                    <Home className="h-6 w-6 text-green-600" />
                                                </div>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900">
                                                Delivery
                                            </h4>
                                            <p className="mt-1.5 text-xs text-gray-600">
                                                Your order will be delivered to
                                                your address with cash payment.
                                            </p>
                                            <div className="mt-1 text-xs font-medium text-green-600">
                                                2-5 business days
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="text-center">
                                <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4">
                                    <h4 className="mb-2 text-base font-bold text-gray-900">
                                        Need Help?
                                    </h4>
                                    <p className="mb-3 text-xs text-gray-600">
                                        If you have any questions about your
                                        order, feel free to contact us.
                                    </p>
                                    <div className="flex flex-col justify-center gap-3 text-xs sm:flex-row">
                                        <div className="flex items-center justify-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-700">
                                                +355 69 123 4567
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-700">
                                                support@andshoes.com
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex flex-col justify-center gap-3 sm:flex-row">
                                <button
                                    onClick={onClose}
                                    className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-offset-2 focus:outline-none"
                                    style={{ backgroundColor: '#771f48' }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            '#5a1737')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            '#771f48')
                                    }
                                >
                                    <Home className="h-4 w-4" />
                                    Continue Shopping
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-md transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:ring-offset-2 focus:outline-none"
                                >
                                    <Package className="h-4 w-4" />
                                    Print Order Details
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
