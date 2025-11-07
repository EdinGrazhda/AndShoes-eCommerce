<?php

namespace App\Console\Commands;

use App\Models\Banner;
use Illuminate\Console\Command;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class RegenerateMediaConversions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:regenerate {--model=Banner : The model to regenerate conversions for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate media conversions for banners';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $model = $this->option('model');
        
        if ($model === 'Banner') {
            $this->regenerateBannerConversions();
        } else {
            $this->error('Unsupported model. Use --model=Banner');
            return 1;
        }
        
        return 0;
    }

    private function regenerateBannerConversions()
    {
        $banners = Banner::all();
        $this->info("Found {$banners->count()} banners to process...");
        
        $progressBar = $this->output->createProgressBar($banners->count());
        $progressBar->start();
        
        foreach ($banners as $banner) {
            $media = $banner->getMedia('banner_images');
            
            foreach ($media as $mediaItem) {
                try {
                    $mediaItem->delete();
                    $this->line("Deleted existing conversions for banner {$banner->id}");
                } catch (\Exception $e) {
                    $this->line("Could not delete conversions for banner {$banner->id}: " . $e->getMessage());
                }
            }
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->newLine();
        $this->info('Media conversions regenerated successfully!');
    }
}
