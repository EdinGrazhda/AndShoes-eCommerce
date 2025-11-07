<?php

namespace App\Console\Commands;

use App\Models\Banner;
use Illuminate\Console\Command;

class TestBannerCreation extends Command
{
    protected $signature = 'test:banner-create';
    protected $description = 'Test banner creation';

    public function handle()
    {
        try {
            $banner = Banner::create([
                'header' => 'Welcome to AndShoes',
                'description' => 'Your trusted destination for quality footwear in Kosovo.'
            ]);

            $this->info("✓ Banner created successfully!");
            $this->info("ID: {$banner->id}");
            $this->info("Header: {$banner->header}");
            $this->info("Description: {$banner->description}");
            $this->info("Table: {$banner->getTable()}");
            
        } catch (\Exception $e) {
            $this->error("✗ Failed to create banner: " . $e->getMessage());
        }
    }
}