import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Category {
    id: number;
    name: string;
    description?: string;
    slug: string;
    created_at?: string;
    updated_at?: string;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category | null;
    onSave: () => void;
}

export const CategoryModal = ({
    isOpen,
    onClose,
    category,
    onSave,
}: CategoryModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                slug: category.slug || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
                slug: '',
            });
        }
        setErrors({});
    }, [category, isOpen]);

    const handleNameChange = (name: string) => {
        setFormData((prev) => ({
            ...prev,
            name,
            slug: generateSlug(name),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const url = category
                ? `/api/categories/${category.id}`
                : '/api/categories';
            const method = category ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(
                    category
                        ? 'Category updated successfully!'
                        : 'Category created successfully!',
                );
                onSave();
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    toast.error(data.message || 'Something went wrong');
                }
            }
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Network error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white">
                            {category ? 'Edit Category' : 'Create New Category'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-xl bg-white/20 p-2 text-white transition-colors hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-6">
                        {/* Category Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold tracking-wide text-gray-700">
                                Category Name{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                placeholder="Enter category name..."
                                className={`w-full rounded-2xl border-2 px-4 py-4 text-sm font-medium transition-all duration-300 focus:ring-4 focus:outline-none ${
                                    errors.name
                                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
                                        : 'border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:bg-white focus:ring-blue-100'
                                }`}
                                required
                            />
                            {errors.name && (
                                <p className="text-sm font-medium text-red-600">
                                    {errors.name[0]}
                                </p>
                            )}
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold tracking-wide text-gray-700">
                                Slug <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        slug: e.target.value,
                                    }))
                                }
                                placeholder="category-slug"
                                className={`w-full rounded-2xl border-2 px-4 py-4 text-sm font-medium transition-all duration-300 focus:ring-4 focus:outline-none ${
                                    errors.slug
                                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
                                        : 'border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:bg-white focus:ring-blue-100'
                                }`}
                                required
                            />
                            {errors.slug && (
                                <p className="text-sm font-medium text-red-600">
                                    {errors.slug[0]}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                URL-friendly version of the name. Auto-generated
                                from name.
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold tracking-wide text-gray-700">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Enter category description..."
                                rows={4}
                                className={`w-full resize-none rounded-2xl border-2 px-4 py-4 text-sm font-medium transition-all duration-300 focus:ring-4 focus:outline-none ${
                                    errors.description
                                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
                                        : 'border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:bg-white focus:ring-blue-100'
                                }`}
                            />
                            {errors.description && (
                                <p className="text-sm font-medium text-red-600">
                                    {errors.description[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl border-2 border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading
                                ? category
                                    ? 'Updating...'
                                    : 'Creating...'
                                : category
                                  ? 'Update Category'
                                  : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
