# Deployment Instructions for Production Server

## Steps to fix the 'Class App\Models\Order not found' error:

### 1. SSH into your production server

### 2. Navigate to your project directory:
cd /path/to/your/andshoes/project

### 3. Pull the latest changes from the images1 branch:
git pull origin images1

### 4. Install/update Composer dependencies:
composer install --optimize-autoloader --no-dev

### 5. Clear all caches:
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear

### 6. Regenerate optimized files:
php artisan config:cache
php artisan route:cache
php artisan view:cache

### 7. Restart PHP-FPM (if applicable):
# For Ubuntu/Debian with PHP 8.4:
sudo systemctl restart php8.4-fpm
# OR for other PHP versions, adjust accordingly:
# sudo systemctl restart php8.1-fpm

### 8. Restart web server (if needed):
# For Apache:
sudo systemctl restart apache2
# For Nginx:
sudo systemctl restart nginx

## Quick Fix (all commands in one line):
git pull origin images1 && composer install --optimize-autoloader --no-dev && php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache

