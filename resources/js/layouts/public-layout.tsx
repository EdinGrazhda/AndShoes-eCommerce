import { type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface PublicLayoutProps {
    children: ReactNode;
    className?: string;
}

export default function PublicLayout({
    children,
    className = '',
}: PublicLayoutProps) {
    return (
        <div className={`min-h-screen bg-gray-50 ${className}`}>
            {/* Simple header for public pages */}
            <header className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <a href="/" className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                                    <span className="text-sm font-bold text-white">
                                        AS
                                    </span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">
                                    AndShoes
                                </span>
                            </a>
                        </div>
                        <nav className="hidden space-x-8 md:flex">
                            <a
                                href="/"
                                className="font-medium text-gray-600 hover:text-gray-900"
                            >
                                Home
                            </a>
                            <a
                                href="/#products"
                                className="font-medium text-gray-600 hover:text-gray-900"
                            >
                                Products
                            </a>
                            <a
                                href="#contact"
                                className="font-medium text-gray-600 hover:text-gray-900"
                            >
                                Contact
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1">{children}</main>

            {/* Simple footer */}
            <footer className="mt-16 border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="text-center text-gray-600">
                        <p>&copy; 2025 AndShoes. All rights reserved.</p>
                        <p className="mt-2 text-sm">
                            Questions? Contact us at{' '}
                            <a
                                href="mailto:support@andshoes.com"
                                className="text-blue-600 hover:text-blue-500"
                            >
                                support@andshoes.com
                            </a>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Toast notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#10b981',
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: '#ef4444',
                        },
                    },
                }}
            />
        </div>
    );
}
