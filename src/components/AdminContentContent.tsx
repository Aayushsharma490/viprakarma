'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Save, Loader2, FileText, MessageSquare, HelpCircle, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';

interface ContentItem {
    id: string;
    title: string;
    content: string;
    type: 'page' | 'faq' | 'announcement';
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function AdminContentContent() {
    const router = useRouter();
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pages' | 'faqs' | 'announcements'>('pages');
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'page' as ContentItem['type'],
        isPublished: true,
    });

    useEffect(() => {
        fetchContent();
    }, [activeTab]);

    const fetchContent = async () => {
        try {
            const rawToken = localStorage.getItem('admin_token');
            let token: string | null = null;
            if (rawToken) {
                try {
                    const parsed = JSON.parse(rawToken);
                    if (typeof parsed === 'string') token = parsed;
                    else if (parsed && typeof parsed === 'object' && 'token' in parsed) token = (parsed as any).token;
                    else token = String(parsed);
                } catch (e) {
                    token = rawToken;
                }
            }

            if (token === '[object Object]') {
                const adminUserRaw = localStorage.getItem('admin_user');
                if (adminUserRaw) {
                    try {
                        const adminUser = JSON.parse(adminUserRaw);
                        if (adminUser && typeof adminUser === 'object' && 'token' in adminUser) {
                            token = (adminUser as any).token;
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                if (!token || token === '[object Object]') {
                    const fallback = localStorage.getItem('token');
                    if (fallback) token = fallback;
                }
            }

            const response = await fetch(`/api/admin/content?type=${activeTab.slice(0, -1)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/admin/login');
                    return;
                }
                throw new Error('Failed to fetch content');
            }

            const data = await response.json();
            setContent(data);
        } catch (error) {
            console.error('Error fetching content:', error);
            toast.error('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const rawToken = localStorage.getItem('admin_token');
            let token: string | null = null;
            if (rawToken) {
                try {
                    const parsed = JSON.parse(rawToken);
                    if (typeof parsed === 'string') token = parsed;
                    else if (parsed && typeof parsed === 'object' && 'token' in parsed) token = (parsed as any).token;
                    else token = String(parsed);
                } catch (e) {
                    token = rawToken;
                }
            }
            const url = editingItem
                ? `/api/admin/content/${editingItem.id}`
                : '/api/admin/content';

            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save content');
            }

            toast.success(editingItem ? 'Content updated successfully' : 'Content created successfully');
            await fetchContent();
            resetForm();
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error('Failed to save content');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: ContentItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            content: item.content,
            type: item.type,
            isPublished: item.isPublished,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this content?')) return;

        try {
            const rawToken = localStorage.getItem('admin_token');
            let token: string | null = null;
            if (rawToken) {
                try {
                    const parsed = JSON.parse(rawToken);
                    if (typeof parsed === 'string') token = parsed;
                    else if (parsed && typeof parsed === 'object' && 'token' in parsed) token = (parsed as any).token;
                    else token = String(parsed);
                } catch (e) {
                    token = rawToken;
                }
            }

            await fetch(`/api/admin/content/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Content deleted successfully');
            await fetchContent();
        } catch (error) {
            console.error('Error deleting content:', error);
            toast.error('Failed to delete content');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            type: activeTab === 'faqs' ? 'faq' : activeTab === 'announcements' ? 'announcement' : 'page',
            isPublished: true,
        });
        setEditingItem(null);
    };

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'pages': return <FileText className="w-4 h-4" />;
            case 'faqs': return <HelpCircle className="w-4 h-4" />;
            case 'announcements': return <MessageSquare className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen cosmic-gradient">
            <AdminNavbar />

            <div className="container mx-auto px-4 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4 text-cosmic">Content Management</h1>
                    <p className="text-muted-foreground">Manage website content, FAQs, and announcements</p>
                </motion.div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="pages" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Pages
                        </TabsTrigger>
                        <TabsTrigger value="faqs" className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            FAQs
                        </TabsTrigger>
                        <TabsTrigger value="announcements" className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Announcements
                        </TabsTrigger>
                    </TabsList>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Content Form */}
                        <div className="lg:col-span-1">
                            <Card className="glass-effect p-6">
                                <h2 className="text-2xl font-semibold mb-6 text-cosmic">
                                    {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="content">Content *</Label>
                                        <Textarea
                                            id="content"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            rows={8}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isPublished"
                                            checked={formData.isPublished}
                                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <Label htmlFor="isPublished">Published</Label>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 flex-1">
                                            {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
                                            {editingItem ? 'Update' : 'Create'}
                                        </Button>
                                        {editingItem && (
                                            <Button type="button" variant="outline" onClick={resetForm}>
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </Card>
                        </div>

                        {/* Content List */}
                        <div className="lg:col-span-2">
                            <Card className="glass-effect p-6">
                                <h2 className="text-2xl font-semibold mb-6 text-cosmic">
                                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                </h2>

                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                ) : content.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">No {activeTab} found</p>
                                        <Button onClick={() => setEditingItem(null)} className="mt-4">
                                            <Plus className="mr-2 w-4 h-4" />
                                            Add First {activeTab.slice(0, -1)}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {content.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="border border-border rounded-lg p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                                                            <span className={`px-2 py-1 text-xs rounded ${item.isPublished ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                                                                }`}>
                                                                {item.isPublished ? 'Published' : 'Draft'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {item.content.substring(0, 150)}...
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Updated: {new Date(item.updatedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </Tabs>
            </div>

            <Footer />
        </div>
    );
}
