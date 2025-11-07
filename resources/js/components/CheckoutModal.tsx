import {
    Check,
    ChevronRight,
    CreditCard,
    Mail,
    MapPin,
    Package,
    Phone,
    Truck,
    User,
    X,
} from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useCheckoutStore } from '../store/checkoutStore';
import type { Product } from '../types/store';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
}

interface CustomerInfo {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: 'albania' | 'kosovo' | 'macedonia' | '';
}

export const CheckoutModal = memo(
    ({ isOpen, onClose, product }: CheckoutModalProps) => {
        const {
            openSuccess,
            selectedSize: sizeFromStore,
            quantity: quantityFromStore,
        } = useCheckoutStore();
        const { clearCart } = useCartStore();
        const [currentStep, setCurrentStep] = useState(1);
        const [isLoading, setIsLoading] = useState(false);
        const [quantity, setQuantity] = useState(quantityFromStore || 1);

        const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
            full_name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            country: '',
        });

        // Sync quantity from store when modal opens or store quantity changes
        useEffect(() => {
            if (isOpen && quantityFromStore) {
                setQuantity(quantityFromStore);
            }
        }, [isOpen, quantityFromStore]);

        const formatPrice = (price: number): string => {
            return price.toFixed(2);
        };

        // Calculate shipping fee based on country
        const calculateShipping = (
            country: string,
            subtotal: number,
        ): number => {
            if (country === 'kosovo') {
                return 0; // Free shipping for Kosovo
            } else if (country === 'albania' || country === 'macedonia') {
                return 4; // Fixed 4€ shipping fee
            }
            return 0;
        };

        const subtotal = product.price * quantity;
        const shippingFee = calculateShipping(customerInfo.country, subtotal);
        const totalAmount = subtotal + shippingFee;

        const availableSizes = product.foot_numbers
            ? product.foot_numbers.split(',').map((size) => size.trim())
            : ['38', '39', '40', '41', '42', '43', '44', '45'];

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
                    toast.error(
                        'Please fill in all customer information fields',
                    );
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
            try {
                console.log('=== SUBMITTING ORDER ===');
                console.log('Customer Info:', customerInfo);
                console.log('Product:', product);
                console.log('Product.sizeStocks:', product.sizeStocks);
                console.log('Selected Size from Store:', sizeFromStore);
                console.log('Quantity:', quantity);
                console.log('Subtotal:', subtotal);
                console.log('Shipping Fee:', shippingFee);
                console.log('Total Amount:', totalAmount);

                // Use the selected size from store
                const productSize = sizeFromStore || 'Standard';
                console.log('Using selected size:', productSize);

                const orderData = {
                    customer_full_name: customerInfo.full_name,
                    customer_email: customerInfo.email,
                    customer_phone: customerInfo.phone,
                    customer_address: customerInfo.address,
                    customer_city: customerInfo.city,
                    customer_country: customerInfo.country,
                    product_id: product.id,
                    product_price: Number(product.price), // Ensure it's a number
                    product_size: productSize,
                    product_color: product.color || 'As Shown',
                    quantity: Number(quantity), // Ensure it's a number
                    total_amount: Number(totalAmount.toFixed(2)), // Total including shipping
                    shipping_fee: Number(shippingFee.toFixed(2)), // Shipping fee
                    notes: '',
                };

                console.log('Order Data:', orderData);

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

                console.log('Response Status:', response.status);

                const data = await response.json();
                console.log('Response Data:', data);

                if (response.ok) {
                    toast.success('Order placed successfully!');
                    // Clear cart after successful order
                    clearCart();
                    onClose();
                    // Open success modal with order data
                    openSuccess(data.order);
                } else {
                    console.log('=== ORDER ERROR ===');
                    console.error('Status:', response.status);
                    console.error('Response Data:', data);
                    console.error('Errors:', data.errors);
                    console.error('Message:', data.message);
                    console.error('Requested Size:', data.requested_size);
                    console.error(
                        'Available Sizes from Backend:',
                        data.available_sizes,
                    );
                    if (data.errors) {
                        // Show specific validation errors
                        const errorMessages = Object.entries(data.errors)
                            .map(
                                ([field, messages]: [string, any]) =>
                                    `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`,
                            )
                            .join('\n');
                        toast.error(`Validation errors:\n${errorMessages}`);
                    } else {
                        const errorMessage =
                            data.message || 'Failed to place order';
                        toast.error(errorMessage);
                    }
                }
            } catch (error) {
                console.error('Error placing order:', error);
                toast.error('Network error occurred while placing the order');
            } finally {
                setIsLoading(false);
            }
        };

        const handleClose = () => {
            setCurrentStep(1);
            setQuantity(1);
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

        if (!isOpen) return null;

        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div
                            className="shrink-0 border-b border-gray-200 px-6 py-4"
                            style={{ backgroundColor: '#771f48' }}
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">
                                    Complete Your Order
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Progress Steps */}
                            <div className="mt-4 flex items-center justify-between">
                                {[1, 2, 3].map((step, index) => (
                                    <div
                                        key={step}
                                        className="flex flex-1 items-center"
                                    >
                                        <div className="flex flex-1 flex-col items-center">
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                                                    currentStep >= step
                                                        ? 'border-white bg-white'
                                                        : 'border-white/40 bg-transparent text-white/60'
                                                }`}
                                                style={
                                                    currentStep >= step
                                                        ? { color: '#771f48' }
                                                        : {}
                                                }
                                            >
                                                {currentStep > step ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-sm font-bold">
                                                        {step}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={`mt-1.5 text-xs font-medium ${
                                                    currentStep >= step
                                                        ? 'text-white'
                                                        : 'text-white/60'
                                                }`}
                                            >
                                                {step === 1 && 'Customer'}
                                                {step === 2 && 'Product'}
                                                {step === 3 && 'Confirm'}
                                            </span>
                                        </div>
                                        {index < 2 && (
                                            <div
                                                className={`h-0.5 flex-1 transition-all ${
                                                    currentStep > step
                                                        ? 'bg-white'
                                                        : 'bg-white/30'
                                                }`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Step 1: Customer Information */}
                            {currentStep === 1 && (
                                <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                                            <User
                                                className="h-6 w-6"
                                                style={{ color: '#771f48' }}
                                            />
                                            Customer Information
                                        </h3>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                                            placeholder="Enter your full name"
                                            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                            style={
                                                {
                                                    '--tw-ring-color':
                                                        'rgba(119, 31, 72, 0.1)',
                                                } as React.CSSProperties
                                            }
                                            onFocus={(e) =>
                                                (e.currentTarget.style.borderColor =
                                                    '#771f48')
                                            }
                                            onBlur={(e) =>
                                                (e.currentTarget.style.borderColor =
                                                    '#e5e7eb')
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={customerInfo.email}
                                                    onChange={(e) =>
                                                        setCustomerInfo({
                                                            ...customerInfo,
                                                            email: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="your@email.com"
                                                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pr-4 pl-12 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                                    style={
                                                        {
                                                            '--tw-ring-color':
                                                                'rgba(119, 31, 72, 0.1)',
                                                        } as React.CSSProperties
                                                    }
                                                    onFocus={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            '#771f48')
                                                    }
                                                    onBlur={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            '#e5e7eb')
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={customerInfo.phone}
                                                    onChange={(e) =>
                                                        setCustomerInfo({
                                                            ...customerInfo,
                                                            phone: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="+355 69 123 4567"
                                                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pr-4 pl-12 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                                    style={
                                                        {
                                                            '--tw-ring-color':
                                                                'rgba(119, 31, 72, 0.1)',
                                                        } as React.CSSProperties
                                                    }
                                                    onFocus={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            '#771f48')
                                                    }
                                                    onBlur={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            '#e5e7eb')
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Street Address *
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={customerInfo.address}
                                                onChange={(e) =>
                                                    setCustomerInfo({
                                                        ...customerInfo,
                                                        address: e.target.value,
                                                    })
                                                }
                                                placeholder="Street address"
                                                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pr-4 pl-12 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                                style={
                                                    {
                                                        '--tw-ring-color':
                                                            'rgba(119, 31, 72, 0.1)',
                                                    } as React.CSSProperties
                                                }
                                                onFocus={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#771f48')
                                                }
                                                onBlur={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#e5e7eb')
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                                                placeholder="Enter city"
                                                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                                style={
                                                    {
                                                        '--tw-ring-color':
                                                            'rgba(119, 31, 72, 0.1)',
                                                    } as React.CSSProperties
                                                }
                                                onFocus={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#771f48')
                                                }
                                                onBlur={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#e5e7eb')
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Country *
                                            </label>
                                            <select
                                                value={customerInfo.country}
                                                onChange={(e) =>
                                                    setCustomerInfo({
                                                        ...customerInfo,
                                                        country: e.target
                                                            .value as
                                                            | 'albania'
                                                            | 'kosovo'
                                                            | 'macedonia',
                                                    })
                                                }
                                                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                                style={
                                                    {
                                                        '--tw-ring-color':
                                                            'rgba(119, 31, 72, 0.1)',
                                                    } as React.CSSProperties
                                                }
                                                onFocus={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#771f48')
                                                }
                                                onBlur={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#e5e7eb')
                                                }
                                            >
                                                <option value="">
                                                    Select country
                                                </option>
                                                <option value="albania">
                                                    Albania
                                                </option>
                                                <option value="kosovo">
                                                    Kosovo
                                                </option>
                                                <option value="macedonia">
                                                    Macedonia
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Product Information */}
                            {currentStep === 2 && (
                                <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                            <Package
                                                className="h-5 w-5"
                                                style={{ color: '#771f48' }}
                                            />
                                            Product Information
                                        </h3>
                                    </div>

                                    {/* Product Image & Name */}
                                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
                                        <div className="flex gap-4 p-4">
                                            {product.image && (
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h4 className="mb-1.5 text-lg font-bold text-gray-900">
                                                    {product.name}
                                                </h4>
                                                {product.description && (
                                                    <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                                                        {product.description}
                                                    </p>
                                                )}
                                                <div className="flex items-baseline gap-2">
                                                    <span
                                                        className="text-xl font-bold"
                                                        style={{
                                                            color: '#771f48',
                                                        }}
                                                    >
                                                        €
                                                        {formatPrice(
                                                            product.price,
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        per pair
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Specifications */}
                                    <div className="space-y-3 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
                                        <h5 className="mb-3 text-base font-bold text-gray-900">
                                            Specifications
                                        </h5>

                                        <div className="grid grid-cols-2 gap-3">
                                            {product.categories &&
                                                product.categories.length >
                                                    0 && (
                                                    <div className="rounded-lg bg-white p-3 shadow-sm">
                                                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                            Category
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-gray-900">
                                                            {
                                                                product
                                                                    .categories[0]
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                            {product.gender && (
                                                <div className="rounded-lg bg-white p-3 shadow-sm">
                                                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                        Gender
                                                    </p>
                                                    <p className="mt-1 text-sm font-bold text-gray-900 capitalize">
                                                        {product.gender}
                                                    </p>
                                                </div>
                                            )}

                                            {product.color && (
                                                <div className="rounded-lg bg-white p-3 shadow-sm">
                                                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                        Color
                                                    </p>
                                                    <p className="mt-1 text-sm font-bold text-gray-900 capitalize">
                                                        {product.color}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Selected Size */}
                                            <div className="rounded-lg bg-white p-3 shadow-sm">
                                                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                    Selected Size
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-gray-900">
                                                    {sizeFromStore ||
                                                        'Not selected'}
                                                </p>
                                            </div>

                                            {/* Quantity */}
                                            <div className="rounded-lg bg-white p-3 shadow-sm">
                                                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                    Quantity
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-gray-900">
                                                    {quantity}{' '}
                                                    {quantity === 1
                                                        ? 'item'
                                                        : 'items'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Summary - Price Breakdown */}
                                        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
                                            <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                Order Summary
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        Subtotal ({quantity}{' '}
                                                        {quantity === 1
                                                            ? 'item'
                                                            : 'items'}
                                                        )
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        €{formatPrice(subtotal)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        Shipping
                                                        {customerInfo.country ===
                                                            'kosovo' &&
                                                            ' (Kosovo)'}
                                                        {customerInfo.country ===
                                                            'albania' &&
                                                            ' (Albania - 4€)'}
                                                        {customerInfo.country ===
                                                            'macedonia' &&
                                                            ' (Macedonia - 4€)'}
                                                    </span>
                                                    <span
                                                        className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}
                                                    >
                                                        {shippingFee === 0
                                                            ? 'FREE'
                                                            : `€${formatPrice(shippingFee)}`}
                                                    </span>
                                                </div>
                                                <div className="mt-2 border-t border-gray-200 pt-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-base font-bold text-gray-900">
                                                            Total
                                                        </span>
                                                        <span
                                                            className="text-lg font-bold"
                                                            style={{
                                                                color: '#771f48',
                                                            }}
                                                        >
                                                            €
                                                            {formatPrice(
                                                                totalAmount,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div
                                        className="rounded-xl border p-4"
                                        style={{
                                            borderColor: '#771f48',
                                            backgroundColor:
                                                'rgba(119, 31, 72, 0.03)',
                                        }}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div
                                                className="rounded-full p-1.5"
                                                style={{
                                                    backgroundColor: '#771f48',
                                                }}
                                            >
                                                <Truck className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h6 className="text-sm font-bold text-gray-900">
                                                    Shipping Information
                                                </h6>
                                                <p className="text-xs text-gray-600">
                                                    {customerInfo.country ===
                                                    'kosovo'
                                                        ? '🎉 Free shipping for Kosovo!'
                                                        : customerInfo.country ===
                                                            'albania'
                                                          ? '📦 Shipping fee: 4€ (Albania)'
                                                          : customerInfo.country ===
                                                              'macedonia'
                                                            ? '📦 Shipping fee: 4€ (Macedonia)'
                                                            : '📦 Free shipping (Kosovo)'}{' '}
                                                    Your product will be
                                                    carefully packaged and
                                                    shipped to your address.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Confirmation */}
                            {currentStep === 3 && (
                                <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                            <Check className="h-5 w-5 text-green-600" />
                                            Review Your Order
                                        </h3>
                                    </div>

                                    {/* Customer Info Summary */}
                                    <div
                                        className="rounded-xl border border-gray-200 p-4"
                                        style={{
                                            background:
                                                'linear-gradient(to bottom right, rgba(119, 31, 72, 0.05), rgba(119, 31, 72, 0.1))',
                                        }}
                                    >
                                        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                                            <User
                                                className="h-4 w-4"
                                                style={{ color: '#771f48' }}
                                            />
                                            Delivery Information
                                        </h4>
                                        <div className="space-y-1.5 text-xs">
                                            <p>
                                                <span className="font-semibold">
                                                    Name:
                                                </span>{' '}
                                                {customerInfo.full_name}
                                            </p>
                                            <p>
                                                <span className="font-semibold">
                                                    Email:
                                                </span>{' '}
                                                {customerInfo.email}
                                            </p>
                                            <p>
                                                <span className="font-semibold">
                                                    Phone:
                                                </span>{' '}
                                                {customerInfo.phone}
                                            </p>
                                            <p>
                                                <span className="font-semibold">
                                                    Address:
                                                </span>{' '}
                                                {customerInfo.address},{' '}
                                                {customerInfo.city},{' '}
                                                {customerInfo.country
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    customerInfo.country.slice(
                                                        1,
                                                    )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Product Summary */}
                                    <div
                                        className="rounded-xl border border-gray-200 p-4"
                                        style={{
                                            background:
                                                'linear-gradient(to bottom right, rgba(119, 31, 72, 0.05), rgba(119, 31, 72, 0.15))',
                                        }}
                                    >
                                        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                                            <Package
                                                className="h-4 w-4"
                                                style={{ color: '#771f48' }}
                                            />
                                            Order Summary
                                        </h4>
                                        <div className="mb-3 flex items-center gap-3">
                                            {product.image && (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-14 w-14 rounded-lg object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h5 className="text-sm font-bold text-gray-900">
                                                    {product.name}
                                                </h5>
                                                <p className="text-xs text-gray-600">
                                                    {product.categories &&
                                                        product.categories
                                                            .length > 0 &&
                                                        `${product.categories[0].name} • `}
                                                    {product.gender &&
                                                        `${product.gender.charAt(0).toUpperCase() + product.gender.slice(1)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 border-t border-gray-200 pt-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-600">
                                                    Price per item:
                                                </span>
                                                <span className="font-semibold">
                                                    €
                                                    {formatPrice(product.price)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-600">
                                                    Quantity:
                                                </span>
                                                <span className="font-semibold">
                                                    {quantity}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-600">
                                                    Subtotal:
                                                </span>
                                                <span className="font-semibold">
                                                    €{formatPrice(subtotal)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-600">
                                                    Shipping:
                                                </span>
                                                <span
                                                    className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}
                                                >
                                                    {shippingFee === 0
                                                        ? 'FREE'
                                                        : `€${formatPrice(shippingFee)}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 pt-1.5">
                                                <span className="text-sm font-bold text-gray-900">
                                                    Total:
                                                </span>
                                                <span
                                                    className="text-lg font-bold"
                                                    style={{ color: '#771f48' }}
                                                >
                                                    €{formatPrice(totalAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
                                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                                            <CreditCard className="h-4 w-4 text-amber-600" />
                                            Payment Method
                                        </h4>
                                        <p className="text-xs text-amber-800">
                                            💰 <strong>Cash on Delivery</strong>{' '}
                                            - Payment will be collected when
                                            your order is delivered to your
                                            address.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between gap-3">
                                {currentStep > 1 && (
                                    <button
                                        onClick={handlePrevStep}
                                        className="flex items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                )}

                                {currentStep < 3 ? (
                                    <button
                                        onClick={handleNextStep}
                                        className="ml-auto flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
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
                                        Next Step
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={isLoading}
                                        className="ml-auto flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                        style={{
                                            backgroundColor: isLoading
                                                ? '#771f48'
                                                : '#16a34a',
                                        }}
                                        onMouseEnter={(e) =>
                                            !isLoading &&
                                            (e.currentTarget.style.backgroundColor =
                                                '#15803d')
                                        }
                                        onMouseLeave={(e) =>
                                            !isLoading &&
                                            (e.currentTarget.style.backgroundColor =
                                                '#16a34a')
                                        }
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-5 w-5" />
                                                Place Order
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    },
);

CheckoutModal.displayName = 'CheckoutModal';
