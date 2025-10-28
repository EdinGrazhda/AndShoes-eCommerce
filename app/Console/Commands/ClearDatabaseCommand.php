<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ClearDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:clear {--force : Force the operation without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all data from the database tables';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('force')) {
            if (!$this->confirm('This will delete ALL data from the database. Are you sure?')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        $this->info('Starting database cleanup...');

        try {
            // Disable foreign key checks
            Schema::disableForeignKeyConstraints();

            // Get all table names
            $tables = DB::select('SHOW TABLES');
            $databaseName = DB::getDatabaseName();
            $tableKey = 'Tables_in_' . $databaseName;

            // Exclude migrations table to preserve schema
            $excludedTables = ['migrations'];

            $deletedCount = 0;

            foreach ($tables as $table) {
                $tableName = $table->$tableKey;

                if (in_array($tableName, $excludedTables)) {
                    $this->warn("Skipping: {$tableName}");
                    continue;
                }

                // Truncate the table
                DB::table($tableName)->truncate();
                $this->info("Cleared: {$tableName}");
                $deletedCount++;
            }

            // Re-enable foreign key checks
            Schema::enableForeignKeyConstraints();

            $this->newLine();
            $this->info("✓ Successfully cleared {$deletedCount} tables!");
            $this->info('Database is now empty (except migrations table).');

            return 0;

        } catch (\Exception $e) {
            Schema::enableForeignKeyConstraints();
            $this->error('Error clearing database: ' . $e->getMessage());
            return 1;
        }
    }
}
