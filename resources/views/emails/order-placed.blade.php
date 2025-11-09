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
            max-width: 650px;
            margin: 20px auto;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #771f48 0%, #5a1737 100%);
            color: #fff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .header p {
            margin: 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .success-message {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 4px;
        }
        .success-message p {
            margin: 0;
            color: #2e7d32;
            font-size: 16px;
        }
        .customer-info {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .customer-info h2 {
            color: #771f48;
            margin-top: 0;
            font-size: 18px;
            border-bottom: 2px solid #771f48;
            padding-bottom: 10px;
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
        .product-card {
            background: #fff;
            border: 2px solid #771f48;
            border-radius: 12px;
            padding: 0;
            margin: 25px 0;
            overflow: hidden;
        }
        .card-header {
            background: linear-gradient(135deg, #771f48 0%, #9d2a5f 100%);
            color: white;
            padding: 15px 20px;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .product-content {
            padding: 20px;
        }
        .product-info {
            width: 100%;
        }
        .product-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0 0 12px 0;
        }
        .product-specs {
            display: grid;
            gap: 8px;
        }
        .spec-row {
            display: flex;
            font-size: 14px;
        }
        .spec-label {
            font-weight: 600;
            color: #666;
            width: 100px;
            flex-shrink: 0;
        }
        .spec-value {
            color: #333;
        }
        .summary-box {
            background: linear-gradient(135deg, #771f48 0%, #9d2a5f 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 16px;
        }
        .summary-total {
            border-top: 2px solid rgba(255, 255, 255, 0.3);
            margin-top: 10px;
            padding-top: 15px;
            font-size: 20px;
            font-weight: bold;
        }
        .shipping-box {
            background: #f8f9fa;
            border-left: 4px solid #771f48;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .shipping-box h3 {
            color: #771f48;
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: 600;
        }
        .shipping-grid {
            display: grid;
            gap: 10px;
        }
        .shipping-row {
            display: flex;
            font-size: 14px;
        }
        .shipping-label {
            font-weight: 600;
            color: #666;
            width: 100px;
            flex-shrink: 0;
        }
        .shipping-value {
            color: #333;
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
            <div class="success-message">
                <strong>✓ Order Confirmed!</strong> Your order has been received and is being processed.
            </div>

            <div class="customer-info">
                <h2>Order Details</h2>
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

            <div class="product-card">
                <div class="card-header">
                    📦 Your Product
                </div>
                <div class="product-content">
                    <div class="product-info">
                        <h3 class="product-name">{{ $order->product_name }}</h3>
                        <div class="product-specs">
                            @if($order->product_size)
                            <div class="spec-row">
                                <span class="spec-label">Size:</span>
                                <span class="spec-value">{{ $order->product_size }}</span>
                            </div>
                            @endif
                            @if($order->product_color)
                            <div class="spec-row">
                                <span class="spec-label">Color:</span>
                                <span class="spec-value">{{ $order->product_color }}</span>
                            </div>
                            @endif
                            <div class="spec-row">
                                <span class="spec-label">Quantity:</span>
                                <span class="spec-value">{{ $order->quantity }}</span>
                            </div>
                            <div class="spec-row">
                                <span class="spec-label">Unit Price:</span>
                                <span class="spec-value">€{{ number_format($order->product_price, 2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="summary-box">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>€{{ number_format($order->product_price * $order->quantity, 2) }}</span>
                </div>
                <div class="summary-row summary-total">
                    <span>Total Amount:</span>
                    <span>€{{ number_format($order->total_amount, 2) }}</span>
                </div>
            </div>

            <div class="shipping-box">
                <h3>🚚 Shipping Information</h3>
                <div class="shipping-grid">
                    <div class="shipping-row">
                        <span class="shipping-label">Name:</span>
                        <span class="shipping-value">{{ $order->customer_full_name }}</span>
                    </div>
                    <div class="shipping-row">
                        <span class="shipping-label">Email:</span>
                        <span class="shipping-value">{{ $order->customer_email }}</span>
                    </div>
                    <div class="shipping-row">
                        <span class="shipping-label">Phone:</span>
                        <span class="shipping-value">{{ $order->customer_phone }}</span>
                    </div>
                    <div class="shipping-row">
                        <span class="shipping-label">Country:</span>
                        <span class="shipping-value">{{ ucfirst($order->customer_country) }}</span>
                    </div>
                    <div class="shipping-row">
                        <span class="shipping-label">City:</span>
                        <span class="shipping-value">{{ $order->customer_city }}</span>
                    </div>
                    <div class="shipping-row">
                        <span class="shipping-label">Address:</span>
                        <span class="shipping-value">{{ $order->customer_address }}</span>
                    </div>
                </div>
            </div>

            <p style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #771f48;">
                <strong>📧 What's Next?</strong><br>
                We'll send you another email with tracking information once your order ships. 
                If you have any questions, feel free to contact us at any time.
            </p>
        </div>

        <div class="footer">
            <p style="margin: 0 0 10px 0; font-weight: 600;">Thank you for shopping with <strong style="color: #771f48;">AndShoes</strong></p>
            <p style="margin: 10px 0;">
                Need help? Contact us at 
                <a href="mailto:info@andshoes-ks.com" style="color: #771f48; font-weight: 600;">info@andshoes-ks.com</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This is an automated email. Please do not reply directly to this message.
            </p>
        </div>
    </div>
</body>
</html>
