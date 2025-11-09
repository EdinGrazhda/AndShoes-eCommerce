import { Check, Package, X } from 'lucide-react';
import { memo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useCheckoutStore } from '../store/checkoutStore';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CustomerInfo {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: 'albania' | 'kosovo' | 'macedonia' | '';
}

export const CheckoutModal = memo(({ isOpen, onClose }: CheckoutModalProps) => {
    const { items, openSuccess, openMultiSuccess } = useCheckoutStore();
    const { clearCart } = useCartStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [orderProgress, setOrderProgress] = useState({
        current: 0,
        total: 0,
    });

    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
    });

    const formatPrice = (price: number): string => {
        return price.toFixed(2);
    };

    // Calculate shipping fee based on country
    const calculateShipping = (country: string, subtotal: number): number => {
        if (country === 'kosovo') {
            return 0; // Free shipping for Kosovo
        } else if (country === 'albania' || country === 'macedonia') {
            return 4; // Fixed 4€ shipping fee
        }
        return 0;
    };

    // Calculate totals for all items
    const subtotal = items.reduce((total, item) => {
        return total + item.product.price * item.quantity;
    }, 0);

    const shippingFee = calculateShipping(customerInfo.country, subtotal);
    const totalAmount = subtotal + shippingFee;

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (
                !customerInfo.full_name ||
                !customerInfo.email ||
                !customerInfo.phone ||
                !customerInfo.address ||
                !customerInfo.city ||
                !customerInfo.country
            ) {
                toast.error('Please fill in all customer information fields');
                return;
            }
        }
        setCurrentStep(currentStep + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmitOrder = async () => {
        setIsLoading(true);
        setOrderProgress({ current: 0, total: items.length });

        try {
            console.log('=== SUBMITTING MULTIPLE ORDERS ===');
            console.log('Customer Info:', customerInfo);
            console.log('Items:', items);
            console.log('Subtotal:', subtotal);
            console.log('Shipping Fee:', shippingFee);
            console.log('Total Amount:', totalAmount);

            // Generate batch_id for multi-orders
            const batchId =
                items.length > 1
                    ? `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                    : null;

            console.log('Batch ID:', batchId);

            // Create order promises for parallel execution
            const orderPromises = items.map(async (item) => {
                const productSize = item.selectedSize || 'Standard';

                // Calculate individual item total (proportional shipping)
                const itemSubtotal = item.product.price * item.quantity;
                const itemShippingProportion =
                    shippingFee * (itemSubtotal / subtotal);
                const itemTotal = itemSubtotal + itemShippingProportion;

                const orderData = {
                    batch_id: batchId,
                    customer_full_name: customerInfo.full_name,
                    customer_email: customerInfo.email,
                    customer_phone: customerInfo.phone,
                    customer_address: customerInfo.address,
                    customer_city: customerInfo.city,
                    customer_country: customerInfo.country,
                    product_id: item.product.id,
                    product_price: Number(item.product.price),
                    product_size: productSize,
                    product_color: item.product.color || 'As Shown',
                    quantity: Number(item.quantity),
                    total_amount: Number(itemTotal.toFixed(2)),
                    shipping_fee: Number(itemShippingProportion.toFixed(2)),
                    notes: batchId
                        ? `Part of ${items.length} item order`
                        : null,
                };

                console.log(
                    `Order Data for item ${item.product.id}:`,
                    orderData,
                );

                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(orderData),
                });

                const data = await response.json();
                console.log(
                    `Response Status for item ${item.product.id}:`,
                    response.status,
                );
                console.log(`Response Data for item ${item.product.id}:`, data);

                if (!response.ok) {
                    console.log('=== ORDER ERROR ===');
                    console.error('Status:', response.status);
                    console.error('Response Data:', data);

                    if (data.errors) {
                        const errorMessages = Object.entries(data.errors)
                            .map(
                                ([field, messages]: [string, any]) =>
                                    `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`,
                            )
                            .join('\n');
                        throw new Error(
                            `Validation errors for ${item.product.name}:\n${errorMessages}`,
                        );
                    } else {
                        const errorMessage =
                            data.message || 'Failed to place order';
                        throw new Error(
                            `Error for ${item.product.name}: ${errorMessage}`,
                        );
                    }
                }

                return { item, order: data.order };
            });

            // Execute all orders in parallel
            const orderResults = await Promise.all(orderPromises);
            const orders = orderResults.map((result) => result.order);

            // If all orders were successful
            if (orders.length === items.length) {
                toast.success(
                    `Successfully placed ${orders.length} ${orders.length === 1 ? 'order' : 'orders'}!`,
                );
                clearCart();
                onClose();

                // Open appropriate success modal
                if (orders.length > 1) {
                    // Multiple orders - use multi-order success modal
                    openMultiSuccess(orders, totalAmount);
                } else if (orders.length === 1) {
                    // Single order - use single order success modal
                    openSuccess(orders[0]);
                }
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Network error occurred while placing the order');
        } finally {
            setIsLoading(false);
            setOrderProgress({ current: 0, total: 0 });
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setOrderProgress({ current: 0, total: 0 });
        setCustomerInfo({
            full_name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            country: '',
        });
        onClose();
    };

    if (!isOpen || items.length === 0) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/40" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{ backgroundColor: '#771f48' }}
                    >
                        <h2 className="text-xl font-bold text-white">
                            Checkout ({items.length}{' '}
                            {items.length === 1 ? 'item' : 'items'})
                        </h2>
                        <button
                            onClick={handleClose}
                            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Steps Indicator */}
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            {[
                                { num: 1, label: 'Info' },
                                { num: 2, label: 'Review' },
                                { num: 3, label: 'Confirm' },
                            ].map((step, index) => (
                                <div
                                    key={step.num}
                                    className="flex flex-1 items-center"
                                >
                                    <div className="flex flex-1 flex-col items-center">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                                                currentStep >= step.num
                                                    ? 'text-white'
                                                    : 'bg-gray-300 text-gray-600'
                                            }`}
                                            style={
                                                currentStep >= step.num
                                                    ? {
                                                          backgroundColor:
                                                              '#771f48',
                                                      }
                                                    : {}
                                            }
                                        >
                                            {currentStep > step.num ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                step.num
                                            )}
                                        </div>
                                        <span className="mt-1 text-xs font-medium text-gray-600">
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < 2 && (
                                        <div
                                            className="flex-1 border-t-2 border-gray-300"
                                            style={
                                                currentStep > step.num
                                                    ? { borderColor: '#771f48' }
                                                    : {}
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6">
                        {/* Step 1: Customer Information */}
                        {currentStep === 1 && (
                            <div className="space-y-5">
                                <h3
                                    className="text-base font-bold"
                                    style={{ color: '#771f48' }}
                                >
                                    Customer Information
                                </h3>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerInfo.full_name}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    full_name: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 focus:outline-none"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={customerInfo.email}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 focus:outline-none"
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            value={customerInfo.phone}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 focus:outline-none"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Country *
                                        </label>
                                        <select
                                            value={customerInfo.country}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    country: e.target
                                                        .value as any,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 focus:outline-none"
                                        >
                                            <option value="">
                                                Select country
                                            </option>
                                            <option value="kosovo">
                                                Kosovo (Free Shipping)
                                            </option>
                                            <option value="albania">
                                                Albania (+4€ shipping)
                                            </option>
                                            <option value="macedonia">
                                                Macedonia (+4€ shipping)
                                            </option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Address *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerInfo.address}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    address: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 focus:outline-none"
                                            placeholder="Enter your address"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerInfo.city}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    city: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 focus:outline-none"
                                            placeholder="Enter your city"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Order Review */}
                        {currentStep === 2 && (
                            <div className="space-y-5">
                                <h3
                                    className="text-base font-bold"
                                    style={{ color: '#771f48' }}
                                >
                                    Review Your Order ({items.length}{' '}
                                    {items.length === 1 ? 'item' : 'items'})
                                </h3>

                                {/* Items List */}
                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div
                                            key={`${item.product.id}-${index}`}
                                            className="rounded-lg border-2 border-gray-100 bg-gray-50 p-4 transition-colors hover:border-[#771f48]/20"
                                        >
                                            <div className="flex gap-4">
                                                {item.product.image && (
                                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                        <img
                                                            src={
                                                                item.product
                                                                    .image
                                                            }
                                                            alt={
                                                                item.product
                                                                    .name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">
                                                        {item.product.name}
                                                    </h4>
                                                    <div className="mt-1 text-sm text-gray-600">
                                                        {item.selectedSize && (
                                                            <span>
                                                                Size:{' '}
                                                                {
                                                                    item.selectedSize
                                                                }
                                                            </span>
                                                        )}
                                                        {item.product.color && (
                                                            <span className="ml-3">
                                                                Color:{' '}
                                                                {
                                                                    item.product
                                                                        .color
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">
                                                            €
                                                            {formatPrice(
                                                                item.product
                                                                    .price,
                                                            )}{' '}
                                                            × {item.quantity}
                                                        </span>
                                                        <span
                                                            className="text-lg font-bold"
                                                            style={{
                                                                color: '#771f48',
                                                            }}
                                                        >
                                                            €
                                                            {formatPrice(
                                                                item.product
                                                                    .price *
                                                                    item.quantity,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div
                                    className="rounded-lg border-2 p-5"
                                    style={{
                                        borderColor: '#771f48',
                                        backgroundColor: '#fff5f8',
                                    }}
                                >
                                    <h4
                                        className="mb-4 font-bold"
                                        style={{ color: '#771f48' }}
                                    >
                                        Order Summary
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Subtotal:
                                            </span>
                                            <span className="font-semibold">
                                                €{formatPrice(subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Shipping:
                                            </span>
                                            <span
                                                className="font-semibold"
                                                style={{
                                                    color:
                                                        shippingFee === 0
                                                            ? '#10b981'
                                                            : '#000',
                                                }}
                                            >
                                                {shippingFee === 0
                                                    ? 'Free'
                                                    : `€${formatPrice(shippingFee)}`}
                                            </span>
                                        </div>
                                        <div
                                            className="flex justify-between border-t-2 pt-3 text-lg font-bold"
                                            style={{ borderColor: '#771f48' }}
                                        >
                                            <span>Total:</span>
                                            <span style={{ color: '#771f48' }}>
                                                €{formatPrice(totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {currentStep === 3 && (
                            <div className="space-y-5 text-center">
                                <div className="flex justify-center">
                                    <div
                                        className="rounded-full p-3"
                                        style={{ backgroundColor: '#771f48' }}
                                    >
                                        <Package className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <h3
                                    className="text-lg font-bold"
                                    style={{ color: '#771f48' }}
                                >
                                    Ready to Place Order
                                </h3>
                                <p className="text-gray-600">
                                    Please confirm your order to proceed with
                                    checkout.
                                </p>
                                <div
                                    className="rounded-lg border-2 p-5 text-left"
                                    style={{
                                        borderColor: '#771f48',
                                        backgroundColor: '#fff5f8',
                                    }}
                                >
                                    <p className="font-semibold text-yellow-800">
                                        Payment Method:
                                    </p>
                                    <p className="text-yellow-700">
                                        Cash on Delivery (COD)
                                    </p>
                                    <p className="mt-2 text-yellow-600">
                                        You will pay when you receive your
                                        order.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                {currentStep > 1 && (
                                    <button
                                        onClick={handlePrevStep}
                                        className="rounded-lg border-2 border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        ← Previous
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div
                                    className="text-lg font-bold"
                                    style={{ color: '#771f48' }}
                                >
                                    Total: €{formatPrice(totalAmount)}
                                </div>

                                {currentStep < 3 ? (
                                    <button
                                        onClick={handleNextStep}
                                        className="rounded-lg px-6 py-2.5 font-semibold text-white transition-all hover:opacity-90"
                                        style={{ backgroundColor: '#771f48' }}
                                    >
                                        Next →
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={isLoading}
                                        className="rounded-lg px-6 py-2.5 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{ backgroundColor: '#771f48' }}
                                    >
                                        {isLoading
                                            ? `Placing Orders... (${orderProgress.total} items)`
                                            : 'Place Order'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

CheckoutModal.displayName = 'CheckoutModal';
