<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Interfaces\OperationInterface ;

use App\Services\CreditService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(OperationInterface::class, function ($app) {
            return new CreditService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
