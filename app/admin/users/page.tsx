'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, Ban, CheckCircle, LayoutDashboard } from 'lucide-react';

const MOCK_USERS = [
  { id: '1', name: 'Aarav Sharma', age: 24, role: 'guest', status: 'active' },
  { id: '2', name: 'Ananya Gupta', age: 27, role: 'host', status: 'active' },
  { id: '3', name: 'Rohan Patel', age: 22, role: 'guest', status: 'banned' },
  { id: '4', name: 'Ishita Verma', age: 29, role: 'host', status: 'active' },
  { id: '5', name: 'Karan Singh', age: 29, role: 'guest', status: 'active' },
  { id: '6', name: 'Maya Joshi', age: 23, role: 'guest', status: 'inactive' },
  { id: '7', name: 'Arjun Nair', age: 31, role: 'host', status: 'active' },
  { id: '8', name: 'Diya Malhotra', age: 25, role: 'guest', status: 'banned' },
  { id: '9', name: 'Vivaan Kapoor', age: 28, role: 'host', status: 'active' },
  { id: '10', name: 'Sara Khan', age: 24, role: 'guest', status: 'active' },
];

export default function AdminUsers() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(MOCK_USERS);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBan = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => u.id === id ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' as const } : u)
    );
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'banned': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted bg-surface-light';
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-white mb-6">Users</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          className="input pl-10"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs uppercase border-b border-border">
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Age</th>
              <th className="text-left py-3 px-2">Role</th>
              <th className="text-left py-3 px-2">Status</th>
              <th className="text-right py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-border/50">
                <td className="py-3 px-2 text-white font-medium">{user.name}</td>
                <td className="py-3 px-2 text-muted">{user.age}</td>
                <td className="py-3 px-2">
                  <span className="text-xs capitalize">{user.role}</span>
                </td>
                <td className="py-3 px-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1 justify-end">
                    {user.role === 'host' && (
                      <button
                        onClick={() => router.push(`/admin/host-dashboard/${user.id}`)}
                        className="btn-ghost text-xs p-1.5 text-gold"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button className="btn-ghost text-xs p-1.5">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleBan(user.id)}
                      className={`btn-ghost text-xs p-1.5 ${
                        user.status === 'banned' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {user.status === 'banned' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
