<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
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
            background: linear-gradient(135deg, #761f49 0%, #5a1737 100%);
            color: #fff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
        }
        .order-info {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .order-info h2 {
            color: #761f49;
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
        }
        .product-details {
            background: #fff;
            border: 2px solid #761f49;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .product-details h3 {
            color: #761f49;
            margin-top: 0;
        }
        .product-item {
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .product-item:last-child {
            border-bottom: none;
        }
        .total {
            background: #761f49;
            color: #fff;
            padding: 15px 20px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
            text-align: right;
        }
        .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .footer a {
            color: #761f49;
            text-decoration: none;
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
        .status-processing {
            background: #d1ecf1;
            color: #0c5460;
        }
        .status-completed {
            background: #d4edda;
            color: #155724;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
        </div>

        <div class="content">
            <p>Dear {{ $order->customer_full_name }},</p>
            <p>Thank you for your order! We're excited to confirm that we've received your order and it's being processed.</p>

            <div class="order-info">
                <h2>Order Information</h2>
                <div class="info-row">
                    <span class="label">Order Number:</span>
                    <span class="value">#{{ $order->order_number }}</span>
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
                <h3>📦 Product Details</h3>
                
                <div class="product-item" style="margin-top: 20px;">
                    <strong>Product:</strong> {{ $order->product_name }}<br>
                    @if($order->product_size)
                        <strong>Size:</strong> {{ $order->product_size }}<br>
                    @endif
                    <strong>Quantity:</strong> {{ $order->quantity }}<br>
                    <strong>Price per item:</strong> €{{ number_format($order->product_price, 2) }}<br>
                    @if($order->product_color)
                        <strong>Color:</strong> {{ $order->product_color }}<br>
                    @endif
                </div>
            </div>

            <div class="total">
                Total Amount: €{{ number_format($order->total_amount, 2) }}
            </div>

            <div class="order-info">
                <h2>Shipping Information</h2>
                <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">{{ $order->customer_full_name }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">{{ $order->customer_email }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Phone:</span>
                    <span class="value">{{ $order->customer_phone }}</span>
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
                    <span class="label">Address:</span>
                    <span class="value">{{ $order->customer_address }}</span>
                </div>
            </div>

            <p style="margin-top: 30px;">
                We'll send you another email when your order ships. If you have any questions about your order, 
                please don't hesitate to contact us.
            </p>
        </div>

        <div class="footer">
            <p>Thank you for shopping with <strong>AndShoes</strong></p>
            <p>
                Need help? Contact us at 
                <a href="mailto:and.shoes22@gmail.com">and.shoes22@gmail.com</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This is an automated email, please do not reply directly to this message.
            </p>
        </div>
    </div>
</body>
</html>
