'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
    Shield, Users, Globe, Settings, Building, Plus, Trash2, 
    CheckCircle2, AlertCircle, Save, Check, X, ShieldAlert, Edit3, Lock, ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

const AdminHubPage = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'domains' | 'users' | 'configs' | 'estates'>('domains');

    // State for adding new domain
    const [newDomain, setNewDomain] = useState('');
    const [domainTenantId, setDomainTenantId] = useState('11111111-1111-1111-1111-111111111111');
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    // Queries
    const { data: domains = [], isLoading: domainsLoading } = useQuery({
        queryKey: ['adminDomains'],
        queryFn: async () => {
            const { data } = await api.get('/admin/domains');
            return data;
        },
    });

    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const { data } = await api.get('/admin/users');
            return data;
        },
    });

    const { data: configs = [], isLoading: configsLoading } = useQuery({
        queryKey: ['adminConfigs'],
        queryFn: async () => {
            const { data } = await api.get('/admin/system-configs');
            return data;
        },
    });

    const { data: offices = [] } = useQuery({
        queryKey: ['adminOffices'],
        queryFn: async () => {
            const { data } = await api.get('/offices/leicester-hub');
            return [data];
        },
    });

    // Mutations
    const addDomainMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/admin/domains', {
                domain: newDomain,
                tenantId: domainTenantId,
            });
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminDomains'] });
            setNewDomain('');
            setActionMsg(data.message || 'Domain added to authorized whitelist.');
            setTimeout(() => setActionMsg(null), 3500);
        },
    });

    const deleteDomainMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/admin/domains/${id}`);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminDomains'] });
            setActionMsg(data.message || 'Domain removed.');
            setTimeout(() => setActionMsg(null), 3500);
        },
    });

    const updateUserRoleMutation = useMutation({
        mutationFn: async ({ id, role }: { id: string; role: string }) => {
            const { data } = await api.put(`/admin/users/${id}/role`, { role });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            setActionMsg('User role updated successfully.');
            setTimeout(() => setActionMsg(null), 3000);
        },
    });

    const toggleUserStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const { data } = await api.put(`/admin/users/${id}/status`, { isActive });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            setActionMsg('User account status updated.');
            setTimeout(() => setActionMsg(null), 3000);
        },
    });

    const isSuperAdmin = user?.role === 'super_admin';

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-600" /> SpaceBook Administration Hub
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Configure corporate registration domains, employee access roles, estate guides, and booking governance rules.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/approvals"
                        className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 flex items-center gap-1.5"
                    >
                        Approvals Queue →
                    </Link>
                    <Link
                        href="/admin/analytics"
                        className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 flex items-center gap-1.5"
                    >
                        Analytics →
                    </Link>
                </div>
            </div>

            {actionMsg && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{actionMsg}</span>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-8 overflow-x-auto">
                {[
                    { id: 'domains', label: 'Domain Whitelist (Registration)', icon: Globe },
                    { id: 'users', label: 'User Directory & RBAC', icon: Users },
                    { id: 'estates', label: 'Estate & Office Guides', icon: Building },
                    { id: 'configs', label: 'Governance & Grace Limits', icon: Settings },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                                active
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: DOMAIN WHITELIST */}
            {activeTab === 'domains' && (
                <div className="space-y-8">
                    {/* Add Domain Card */}
                    {isSuperAdmin && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                                Authorize Corporate Email Domain
                            </h2>
                            <p className="text-xs text-slate-500 mb-4">
                                Only employees with matching email domains will be permitted to register and authenticate into the platform.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative w-full sm:w-1/2">
                                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">@</span>
                                    <input
                                        type="text"
                                        value={newDomain}
                                        onChange={(e) => setNewDomain(e.target.value)}
                                        placeholder="companydomain.com"
                                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                                    />
                                </div>

                                <select
                                    value={domainTenantId}
                                    onChange={(e) => setDomainTenantId(e.target.value)}
                                    className="w-full sm:w-1/3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                                >
                                    <option value="11111111-1111-1111-1111-111111111111">Cloudfy UK Ltd</option>
                                    <option value="22222222-2222-2222-2222-222222222222">Williams Commerce Ltd</option>
                                    <option value="33333333-3333-3333-3333-333333333333">Brandwidth Group</option>
                                </select>

                                <button
                                    onClick={() => addDomainMutation.mutate()}
                                    disabled={!newDomain.trim() || addDomainMutation.isPending}
                                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50 whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" /> Add Domain Whitelist
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Domains Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Corporate Domains</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Employees registering with these email domains are granted access.</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
                                {domains.length} Whitelisted
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Authorized Domain</th>
                                        <th className="px-6 py-3.5">Assigned Tenant</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5">Created Date</th>
                                        {isSuperAdmin && <th className="px-6 py-3.5 text-right">Action</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                                    {domains.map((d: any) => (
                                        <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                            <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-cyan-400">
                                                @{d.domain}
                                            </td>
                                            <td className="px-6 py-4">{d.tenantName}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {new Date(d.createdAt).toLocaleDateString('en-GB')}
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => deleteDomainMutation.mutate(d.id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        aria-label="Remove domain"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: USER DIRECTORY & RBAC */}
            {activeTab === 'users' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Registered Employee Directory</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Manage user access tiers and permissions.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
                            {users.length} Users
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5">User</th>
                                    <th className="px-6 py-3.5">Tenant</th>
                                    <th className="px-6 py-3.5">Access Role</th>
                                    <th className="px-6 py-3.5">Reservations</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    {isSuperAdmin && <th className="px-6 py-3.5 text-right">Account Control</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                                {users.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                                        </td>
                                        <td className="px-6 py-4">{u.tenantName}</td>
                                        <td className="px-6 py-4">
                                            {isSuperAdmin ? (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => updateUserRoleMutation.mutate({ id: u.id, role: e.target.value })}
                                                    className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                                                >
                                                    <option value="employee">Employee</option>
                                                    <option value="approver">Approver</option>
                                                    <option value="location_admin">Location Admin</option>
                                                    <option value="super_admin">Super Admin</option>
                                                </select>
                                            ) : (
                                                <span className="capitalize font-bold">{u.role.replace('_', ' ')}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">
                                            {u.totalBookings}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                u.isActive
                                                    ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200'
                                                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200'
                                            }`}>
                                                {u.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        {isSuperAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => toggleUserStatusMutation.mutate({ id: u.id, isActive: !u.isActive })}
                                                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                                                        u.isActive
                                                            ? 'border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                            : 'border border-green-200 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    }`}
                                                >
                                                    {u.isActive ? 'Disable Access' : 'Enable Access'}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: ESTATES & GUIDES */}
            {activeTab === 'estates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200">
                                Real Estate Hub
                            </span>
                            <span className="text-xs text-slate-400">United Kingdom</span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Leicester Hub</h3>
                        <p className="text-xs text-slate-500">17 Friar Lane, Leicester, LE1 5RB • 2 Floors • 31 Desks • 2 Rooms</p>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <Link
                                href="/admin/offices/leicester-hub/guide"
                                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                            >
                                <Edit3 className="w-4 h-4" /> Edit Welcome Guide & Induction Booklet
                            </Link>
                            <Link
                                href="/explore/united-kingdom/leicester-hub/guide"
                                target="_blank"
                                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                                aria-label="View live guide"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: GOVERNANCE & CONFIGS */}
            {activeTab === 'configs' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">System Governance Parameters</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Control automatic ghost-booking releases and reservation windows.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                            <label className="block text-xs font-bold text-slate-900 dark:text-white">
                                Ghost Booking Grace Period (Minutes)
                            </label>
                            <p className="text-[11px] text-slate-500">
                                Unconfirmed bookings are auto-cancelled and freed up for colleagues if user does not check in within this time.
                            </p>
                            <input
                                type="number"
                                defaultValue="15"
                                className="w-32 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                            />
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                            <label className="block text-xs font-bold text-slate-900 dark:text-white">
                                Maximum Advance Booking Window (Days)
                            </label>
                            <p className="text-[11px] text-slate-500">
                                Limits how far into the future employees can reserve workstations.
                            </p>
                            <input
                                type="number"
                                defaultValue="14"
                                className="w-32 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHubPage;