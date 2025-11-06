import { Instagram, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
    return (
        <footer
            className="text-gray-100"
            style={{ backgroundColor: '#60183a' }}
        >
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="space-y-2">
                        <h2 className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                            AndShoes
                        </h2>
                        <p className="text-xs text-gray-300">
                            Your trusted destination for quality footwear in
                            Kosovo.
                        </p>
                    </div>

                    {/* Locations */}
                    <div className="space-y-2">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                            <MapPin className="h-4 w-4 text-pink-400" />
                            Our Locations
                        </h3>
                        <ul className="space-y-1.5 text-xs text-gray-300">
                            <li className="flex items-start gap-1.5">
                                <span className="mt-0.5 text-pink-400">📍</span>
                                <span>Rr. Tirana (Përballë Abi Qarshia)</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="mt-0.5 text-pink-400">📍</span>
                                <span>Rr. Zahir Pajaziti</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="mt-0.5 text-pink-400">📍</span>
                                <span>
                                    Rr. De Rada (Afër Stacionit Autobusave)
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                            <Phone className="h-4 w-4 text-pink-400" />
                            Contact Us
                        </h3>
                        <ul className="space-y-1.5 text-xs text-gray-300">
                            <li>
                                <a
                                    href="tel:+38343509944"
                                    className="flex items-center gap-1.5 transition-colors hover:text-pink-300"
                                >
                                    <Phone className="h-3 w-3" />
                                    043 509 944
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+38349831828"
                                    className="flex items-center gap-1.5 transition-colors hover:text-pink-300"
                                >
                                    <Phone className="h-3 w-3" />
                                    049 831 828
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:and.shoes22@gmail.com"
                                    className="flex items-center gap-1.5 transition-colors hover:text-pink-300"
                                >
                                    <Mail className="h-3 w-3" />
                                    and.shoes22@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-white">
                            Follow Us
                        </h3>
                        <div className="flex flex-col gap-2">
                            <a
                                href="https://www.instagram.com/and.shoess/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-md"
                            >
                                <Instagram className="h-4 w-4" />
                                Instagram
                            </a>
                            <a
                                href="https://www.tiktok.com/@and.shoess"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-gray-700 hover:shadow-md"
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                                TikTok
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-6 border-t border-gray-700 pt-4">
                    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <p className="text-xs text-gray-400">
                            © {new Date().getFullYear()} AndShoes. All rights
                            reserved.
                        </p>
                        <div className="flex gap-4 text-xs text-gray-400">
                            <a
                                href="#"
                                className="transition-colors hover:text-pink-300"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="#"
                                className="transition-colors hover:text-pink-300"
                            >
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
