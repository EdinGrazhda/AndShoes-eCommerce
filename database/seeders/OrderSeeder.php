<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        
        if ($products->isEmpty()) {
            $this->command->info('No products found. Please create products first.');
            return;
        }

        $sampleOrders = [
            [
                'customer_full_name' => 'John Doe',
                'customer_email' => 'john.doe@example.com',
                'customer_phone' => '+355691234567',
                'customer_address' => 'Rruga e Durrësit, Nr. 45',
                'customer_city' => 'Tirana',
                'customer_country' => 'albania',
                'quantity' => 1,
                'product_size' => '42',
                'product_color' => 'Black',
                'status' => 'pending',
                'notes' => 'Please call before delivery',
            ],
            [
                'customer_full_name' => 'Alban Krasniqi',
                'customer_email' => 'alban.k@example.com',
                'customer_phone' => '+383449876543',
                'customer_address' => 'Dardania, Vila 12',
                'customer_city' => 'Pristina',
                'customer_country' => 'kosovo',
                'quantity' => 2,
                'product_size' => '40',
                'product_color' => 'White',
                'status' => 'confirmed',
                'notes' => 'Gift wrapping requested',
            ],
            [
                'customer_full_name' => 'Marija Petrovic',
                'customer_email' => 'marija.p@example.com',
                'customer_phone' => '+38970123456',
                'customer_address' => 'Boris Trajkovski 25',
                'customer_city' => 'Skopje',
                'customer_country' => 'macedonia',
                'quantity' => 1,
                'product_size' => '38',
                'product_color' => 'Red',
                'status' => 'shipped',
            ],
            [
                'customer_full_name' => 'Ermal Hoxha',
                'customer_email' => 'ermal.h@example.com',
                'customer_phone' => '+355694567890',
                'customer_address' => 'Bulevardi Dëshmorët e Kombit',
                'customer_city' => 'Tirana',
                'customer_country' => 'albania',
                'quantity' => 3,
                'product_size' => '44',
                'product_color' => 'Blue',
                'status' => 'delivered',
                'notes' => 'Excellent customer, repeat buyer',
            ],
        ];

        foreach ($sampleOrders as $index => $orderData) {
            $product = $products->get($index % $products->count());
            
            Order::create([
                'customer_full_name' => $orderData['customer_full_name'],
                'customer_email' => $orderData['customer_email'],
                'customer_phone' => $orderData['customer_phone'],
                'customer_address' => $orderData['customer_address'],
                'customer_city' => $orderData['customer_city'],
                'customer_country' => $orderData['customer_country'],
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_price' => $product->price,
                'product_image' => $product->image,
                'product_size' => $orderData['product_size'],
                'product_color' => $orderData['product_color'],
                'quantity' => $orderData['quantity'],
                'total_amount' => $product->price * $orderData['quantity'],
                'payment_method' => 'cash',
                'status' => $orderData['status'],
                'notes' => $orderData['notes'] ?? null,
            ]);
        }

        $this->command->info('Sample orders created successfully!');
    }
}
