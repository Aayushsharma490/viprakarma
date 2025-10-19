'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, UserX, Edit, Ban, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subscriptionPlan: string;
  isAdmin: boolean;
  createdAt: string;
  paymentVerifications?: {
    id: number;
    status: string;
    amount: number;
    createdAt: string;
  }[];
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Simplified - no auth header needed
      const response = await fetch('/api/admin/users');

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, action: 'ban' | 'unban' | 'promote' | 'demote') => {
    try {
      // Simplified - no auth header needed
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      toast.success('User status updated successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.subscriptionPlan === filterPlan;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'admin' && user.isAdmin) ||
                         (filterStatus === 'user' && !user.isAdmin);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getStatusBadge = (user: User) => {
    if (user.isAdmin) {
      return <Badge variant="destructive">Admin</Badge>;
    }
    return <Badge variant="secondary">{user.subscriptionPlan}</Badge>;
  };

  return (
    <div className="min-h-screen cosmic-gradient">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-cosmic">User Management</h1>
          <p className="text-muted-foreground">Manage platform users, subscriptions, and permissions</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="user">Regular Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-effect p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{user.name}</h3>
                        {getStatusBadge(user)}
                      </div>
                      <p className="text-primary mb-1">{user.email}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Phone: {user.phone || 'Not provided'} • Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      {user.paymentVerifications && user.paymentVerifications.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">Payments:</span>
                          {user.paymentVerifications.slice(0, 2).map((pv: any) => (
                            <Badge
                              key={pv.id}
                              variant={pv.status === 'approved' ? 'default' : pv.status === 'rejected' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              ₹{pv.amount} - {pv.status}
                            </Badge>
                          ))}
                          {user.paymentVerifications.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{user.paymentVerifications.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!user.isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(user.id, 'promote')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Make Admin
                        </Button>
                      )}
                      {user.isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(user.id, 'demote')}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Remove Admin
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(user.id, 'ban')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Ban User
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found matching your criteria</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
