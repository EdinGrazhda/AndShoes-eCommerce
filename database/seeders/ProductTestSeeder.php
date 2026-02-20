<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSizeStock;
use Illuminate\Database\Seeder;

class ProductTestSeeder extends Seeder
{
    /**
     * Seed 25 test products across categories with size stocks.
     */
    public function run(): void
    {
        // Ensure categories exist (create if missing)
        $categories = [
            'Athletic' => Category::firstOrCreate(
                ['slug' => 'athletic'],
                ['name' => 'Athletic', 'description' => 'Sports and athletic footwear', 'sort_order' => 1, 'is_active' => true]
            ),
            'Casual' => Category::firstOrCreate(
                ['slug' => 'casual'],
                ['name' => 'Casual', 'description' => 'Everyday casual shoes', 'sort_order' => 2, 'is_active' => true]
            ),
            'Formal' => Category::firstOrCreate(
                ['slug' => 'formal'],
                ['name' => 'Formal', 'description' => 'Formal and dress shoes', 'sort_order' => 3, 'is_active' => true]
            ),
            'Boots' => Category::firstOrCreate(
                ['slug' => 'boots'],
                ['name' => 'Boots', 'description' => 'Boots for all occasions', 'sort_order' => 4, 'is_active' => true]
            ),
            'Sandals' => Category::firstOrCreate(
                ['slug' => 'sandals'],
                ['name' => 'Sandals', 'description' => 'Summer sandals and flip-flops', 'sort_order' => 5, 'is_active' => true]
            ),
        ];

        $products = [
            // Athletic (5)
            ['name' => 'Nike Air Max 270',       'price' => 129.99, 'color' => 'Black',       'gender' => 'unisex', 'category' => 'Athletic', 'product_id' => 'ATH-001', 'description' => 'Comfortable running shoes with Air Max technology'],
            ['name' => 'Adidas Ultraboost 22',    'price' => 179.99, 'color' => 'White',       'gender' => 'male',   'category' => 'Athletic', 'product_id' => 'ATH-002', 'description' => 'Premium running shoes with Boost cushioning'],
            ['name' => 'Puma RS-X',               'price' => 109.99, 'color' => 'Grey',        'gender' => 'unisex', 'category' => 'Athletic', 'product_id' => 'ATH-003', 'description' => 'Retro-inspired running sneakers'],
            ['name' => 'New Balance 574',          'price' => 89.99,  'color' => 'Navy',        'gender' => 'male',   'category' => 'Athletic', 'product_id' => 'ATH-004', 'description' => 'Classic lightweight athletic shoe'],
            ['name' => 'Nike ZoomX Vaporfly',      'price' => 249.99, 'color' => 'Green',       'gender' => 'unisex', 'category' => 'Athletic', 'product_id' => 'ATH-005', 'description' => 'Elite marathon racing shoe with carbon plate'],

            // Casual (5)
            ['name' => 'Adidas Stan Smith',       'price' => 85.99,  'color' => 'White',       'gender' => 'unisex', 'category' => 'Casual',   'product_id' => 'CAS-001', 'description' => 'Classic white sneakers for everyday wear'],
            ['name' => 'Converse Chuck Taylor',    'price' => 65.99,  'color' => 'Black',       'gender' => 'unisex', 'category' => 'Casual',   'product_id' => 'CAS-002', 'description' => 'Iconic high-top canvas sneakers'],
            ['name' => 'Vans Old Skool',           'price' => 69.99,  'color' => 'Black',       'gender' => 'unisex', 'category' => 'Casual',   'product_id' => 'CAS-003', 'description' => 'Classic skate shoes with suede and canvas upper'],
            ['name' => 'Reebok Club C 85',         'price' => 74.99,  'color' => 'White',       'gender' => 'female', 'category' => 'Casual',   'product_id' => 'CAS-004', 'description' => 'Vintage tennis-inspired casual shoe'],
            ['name' => 'Nike Air Force 1 Low',     'price' => 109.99, 'color' => 'White',       'gender' => 'unisex', 'category' => 'Casual',   'product_id' => 'CAS-005', 'description' => 'Legendary basketball-inspired casual sneaker'],

            // Formal (5)
            ['name' => 'Oxford Dress Shoes',       'price' => 189.99, 'color' => 'Brown',       'gender' => 'male',   'category' => 'Formal',   'product_id' => 'FRM-001', 'description' => 'Elegant leather dress shoes for formal occasions'],
            ['name' => 'Derby Brogue Shoes',       'price' => 169.99, 'color' => 'Tan',         'gender' => 'male',   'category' => 'Formal',   'product_id' => 'FRM-002', 'description' => 'Classic brogue detailing on premium leather'],
            ['name' => 'Monk Strap Loafer',        'price' => 199.99, 'color' => 'Black',       'gender' => 'male',   'category' => 'Formal',   'product_id' => 'FRM-003', 'description' => 'Double monk strap with polished leather finish'],
            ['name' => 'Patent Leather Heels',     'price' => 159.99, 'color' => 'Black',       'gender' => 'female', 'category' => 'Formal',   'product_id' => 'FRM-004', 'description' => 'Elegant patent leather pumps for evening events'],
            ['name' => 'Suede Loafers',            'price' => 139.99, 'color' => 'Navy',        'gender' => 'male',   'category' => 'Formal',   'product_id' => 'FRM-005', 'description' => 'Soft suede loafers with tassel detail'],

            // Boots (5)
            ['name' => 'Timberland 6-Inch',        'price' => 199.99, 'color' => 'Wheat',       'gender' => 'male',   'category' => 'Boots',    'product_id' => 'BT-001',  'description' => 'Durable waterproof work boots'],
            ['name' => 'Dr. Martens 1460',         'price' => 149.99, 'color' => 'Black',       'gender' => 'unisex', 'category' => 'Boots',    'product_id' => 'BT-002',  'description' => 'Classic leather boots with yellow stitching'],
            ['name' => 'Chelsea Ankle Boots',      'price' => 129.99, 'color' => 'Brown',       'gender' => 'female', 'category' => 'Boots',    'product_id' => 'BT-003',  'description' => 'Sleek elastic-sided ankle boots'],
            ['name' => 'UGG Classic Mini',         'price' => 159.99, 'color' => 'Chestnut',    'gender' => 'female', 'category' => 'Boots',    'product_id' => 'BT-004',  'description' => 'Cozy sheepskin-lined winter boots'],
            ['name' => 'Red Wing Iron Ranger',     'price' => 329.99, 'color' => 'Amber',       'gender' => 'male',   'category' => 'Boots',    'product_id' => 'BT-005',  'description' => 'Heritage cap-toe leather work boot'],

            // Sandals (5)
            ['name' => 'Birkenstock Arizona',      'price' => 89.99,  'color' => 'Brown',       'gender' => 'unisex', 'category' => 'Sandals',  'product_id' => 'SND-001', 'description' => 'Comfortable cork footbed sandals'],
            ['name' => 'Teva Original Universal',  'price' => 49.99,  'color' => 'Black',       'gender' => 'unisex', 'category' => 'Sandals',  'product_id' => 'SND-002', 'description' => 'Adventure-ready sport sandals'],
            ['name' => 'Havaianas Slim',           'price' => 29.99,  'color' => 'Pink',        'gender' => 'female', 'category' => 'Sandals',  'product_id' => 'SND-003', 'description' => 'Lightweight Brazilian rubber flip-flops'],
            ['name' => 'Chaco Z/Cloud',            'price' => 109.99, 'color' => 'Green',       'gender' => 'male',   'category' => 'Sandals',  'product_id' => 'SND-004', 'description' => 'Adjustable strap outdoor sandals with arch support'],
            ['name' => 'Crocs Classic Clog',       'price' => 44.99,  'color' => 'White',       'gender' => 'unisex', 'category' => 'Sandals',  'product_id' => 'SND-005', 'description' => 'Lightweight comfort clogs with ventilation ports'],
        ];

        // Common shoe sizes
        $sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

        foreach ($products as $i => $data) {
            $category = $categories[$data['category']];
            unset($data['category']);

            // Skip if product with this product_id already exists
            if (Product::where('product_id', $data['product_id'])->exists()) {
                continue;
            }

            $product = Product::create(array_merge($data, [
                'category_id' => $category->id,
                'foot_numbers' => implode(', ', $sizes),
            ]));

            // Create size stocks — vary quantities so some are out of stock / low stock
            foreach ($sizes as $size) {
                // Create varied stock: some sizes out-of-stock, some low, some plenty
                $qty = match (true) {
                    $i % 5 === 0 && $size < 38   => 0,   // out of stock on small sizes for every 5th product
                    $i % 3 === 0 && $size === 45  => 0,   // out of stock on size 45 for every 3rd
                    $size === 40 || $size === 41  => rand(15, 30),  // popular sizes get more stock
                    default                       => rand(2, 12),
                };

                ProductSizeStock::create([
                    'product_id' => $product->id,
                    'size' => (string) $size,
                    'quantity' => $qty,
                ]);
            }
        }

        $this->command->info('Created 25 test products with size stocks across 5 categories.');
    }
}
