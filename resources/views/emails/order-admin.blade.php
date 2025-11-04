<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: #fff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .alert-badge {
            display: inline-block;
            background: #fff;
            color: #dc3545;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
        }
        .content {
            padding: 30px;
        }
        .order-info {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .order-info h2 {
            color: #856404;
            margin-top: 0;
            font-size: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #666;
        }
        .value {
            color: #333;
            text-align: right;
        }
        .product-details {
            background: #e7f3ff;
            border: 2px solid #007bff;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .product-details h3 {
            color: #007bff;
            margin-top: 0;
        }
        .product-item {
            padding: 10px 0;
            border-bottom: 1px solid #cce5ff;
        }
        .product-item:last-child {
            border-bottom: none;
        }
        .total {
            background: #28a745;
            color: #fff;
            padding: 15px 20px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
        }
        .customer-info {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .customer-info h2 {
            color: #761f49;
            margin-top: 0;
            font-size: 18px;
        }
        .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .action-button {
            display: inline-block;
            background: #761f49;
            color: #fff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
        }
        .status-pending {
            background: #fef3cd;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Order Alert!</h1>
            <div class="alert-badge">ACTION REQUIRED</div>
        </div>

        <div class="content">
            <p><strong>Hello Admin,</strong></p>
            <p>You have received a new order. Please review and process it as soon as possible.</p>

            <div class="order-info">
                <h2>📋 Order Summary</h2>
                <div class="info-row">
                    <span class="label">Order Number:</span>
                    <span class="value"><strong>#{{ $order->order_number }}</strong></span>
                </div>
                <div class="info-row">
                    <span class="label">Order Date:</span>
                    <span class="value">{{ $order->created_at->format('F d, Y - H:i') }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Status:</span>
                    <span class="value">
                        <span class="status-badge status-{{ $order->status }}">
                            {{ ucfirst($order->status) }}
                        </span>
                    </span>
                </div>
            </div>

            <div class="product-details">
                <h3>📦 Product Information</h3>

                <div class="product-item">
                    <strong>Product:</strong> {{ $order->product_name }}<br>
                    <strong>Quantity:</strong> {{ $order->quantity }}<br>
                    <strong>Price per item:</strong> €{{ number_format($order->product_price, 2) }}<br>
                    @if($order->product_size)
                        <strong>Size:</strong> {{ $order->product_size }}<br>
                    @endif
                    @if($order->product_color)
                        <strong>Color:</strong> {{ $order->product_color }}<br>
                    @endif
                </div>
            </div>

            <div class="total">
                Total Order Value: €{{ number_format($order->total_amount, 2) }}
            </div>

            <div class="customer-info">
                <h2>👤 Customer Information</h2>
                <div class="info-row">
                    <span class="label">Full Name:</span>
                    <span class="value">{{ $order->customer_full_name }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value"><a href="mailto:{{ $order->customer_email }}" style="color: #761f49;">{{ $order->customer_email }}</a></span>
                </div>
                <div class="info-row">
                    <span class="label">Phone:</span>
                    <span class="value"><a href="tel:{{ $order->customer_phone }}" style="color: #761f49;">{{ $order->customer_phone }}</a></span>
                </div>
                <div class="info-row">
                    <span class="label">Country:</span>
                    <span class="value">{{ ucfirst($order->customer_country) }}</span>
                </div>
                <div class="info-row">
                    <span class="label">City:</span>
                    <span class="value">{{ $order->customer_city }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Shipping Address:</span>
                    <span class="value">{{ $order->customer_address }}</span>
                </div>
                @if($order->notes)
                    <div class="info-row">
                        <span class="label">Order Notes:</span>
                        <span class="value">{{ $order->notes }}</span>
                    </div>
                @endif
                <div class="info-row">
                    <span class="label">Payment Method:</span>
                    <span class="value">{{ ucfirst(str_replace('_', ' ', $order->payment_method)) }}</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{ config('app.url') }}/admin/orders" class="action-button">
                    View Order in Admin Panel
                </a>
            </div>

            <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 6px;">
                <strong>⚠️ Action Required:</strong> Please process this order and update the customer with shipping information.
            </p>
        </div>

        <div class="footer">
            <p><strong>AndShoes Admin Panel</strong></p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
                This is an automated notification for new orders.
            </p>
        </div>
    </div>
</body>
</html>
