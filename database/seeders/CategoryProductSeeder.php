<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;

class CategoryProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories
        $athletic = Category::create([
            'name' => 'Athletic',
            'slug' => 'athletic',
            'description' => 'Sports and athletic footwear',
            'sort_order' => 1,
            'is_active' => true
        ]);

        $casual = Category::create([
            'name' => 'Casual',
            'slug' => 'casual',
            'description' => 'Everyday casual shoes',
            'sort_order' => 2,
            'is_active' => true
        ]);

        $formal = Category::create([
            'name' => 'Formal',
            'slug' => 'formal',
            'description' => 'Formal and dress shoes',
            'sort_order' => 3,
            'is_active' => true
        ]);

        $boots = Category::create([
            'name' => 'Boots',
            'slug' => 'boots',
            'description' => 'Boots for all occasions',
            'sort_order' => 4,
            'is_active' => true
        ]);

        $sandals = Category::create([
            'name' => 'Sandals',
            'slug' => 'sandals',
            'description' => 'Summer sandals and flip-flops',
            'sort_order' => 5,
            'is_active' => true
        ]);

        // Create products
        $products = [
            [
                'name' => 'Nike Air Max 270',
                'description' => 'Comfortable running shoes with Air Max technology for maximum comfort and style',
                'price' => 129.99,
                'stock' => 'in stock',
                'image' => 'https://example.com/nike-air-max-270.jpg',
                'color' => 'Black/White',
                'foot_numbers' => '38, 39, 40, 41, 42, 43, 44',
                'categories' => [$athletic->id]
            ],
            [
                'name' => 'Adidas Stan Smith',
                'description' => 'Classic white sneakers perfect for everyday casual wear',
                'price' => 85.99,
                'stock' => 'in stock',
                'image' => 'https://example.com/adidas-stan-smith.jpg',
                'color' => 'White/Green',
                'foot_numbers' => '36, 37, 38, 39, 40, 41, 42',
                'categories' => [$casual->id]
            ],
            [
                'name' => 'Converse Chuck Taylor All Star',
                'description' => 'Iconic high-top canvas sneakers with timeless design',
                'price' => 65.99,
                'stock' => 'in stock',
                'image' => 'https://example.com/converse-chuck-taylor.jpg',
                'color' => 'Black',
                'foot_numbers' => '35, 36, 37, 38, 39, 40, 41, 42, 43',
                'categories' => [$casual->id]
            ],
            [
                'name' => 'Oxford Dress Shoes',
                'description' => 'Elegant leather dress shoes perfect for formal occasions and business meetings',
                'price' => 189.99,
                'stock' => 'low stock',
                'image' => 'https://example.com/oxford-dress-shoes.jpg',
                'color' => 'Brown',
                'foot_numbers' => '39, 40, 41, 42, 43, 44',
                'categories' => [$formal->id]
            ],
            [
                'name' => 'Timberland Work Boots',
                'description' => 'Durable work boots with steel toe protection',
                'price' => 199.99,
                'stock' => 'low stock',
                'image' => 'https://example.com/timberland-work-boots.jpg',
                'color' => 'Brown',
                'foot_numbers' => '40, 41, 42, 43, 44, 45',
                'categories' => [$boots->id]
            ],
            [
                'name' => 'Nike Air Jordan 1',
                'description' => 'Classic basketball shoes with retro style',
                'price' => 159.99,
                'stock' => 'in stock',
                'image' => 'https://example.com/nike-air-jordan-1.jpg',
                'color' => 'Red/Black/White',
                'foot_numbers' => '38, 39, 40, 41, 42, 43, 44, 45',
                'categories' => [$athletic->id, $casual->id]
            ],
            [
                'name' => 'Birkenstock Arizona',
                'description' => 'Comfortable leather sandals with cork footbed',
                'price' => 89.99,
                'stock' => 'in stock',
                'image' => 'https://example.com/birkenstock-arizona.jpg',
                'color' => 'Brown',
                'foot_numbers' => '36, 37, 38, 39, 40, 41, 42, 43',
                'categories' => [$sandals->id]
            ],
            [
                'name' => 'Dr. Martens 1460',
                'description' => 'Classic leather boots with distinctive yellow stitching',
                'price' => 149.99,
                'stock' => 'in stock',
                'image' => 'https://example.com/dr-martens-1460.jpg',
                'color' => 'Black',
                'foot_numbers' => '37, 38, 39, 40, 41, 42, 43, 44',
                'categories' => [$boots->id, $casual->id]
            ]
        ];

        foreach ($products as $productData) {
            $categories = $productData['categories'];
            unset($productData['categories']);
            
            $product = Product::create($productData);
            $product->categories()->attach($categories);
        }
    }
}