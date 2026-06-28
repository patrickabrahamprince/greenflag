import type { AdminUser } from './types';

export interface UsersTableProps {
  users: AdminUser[];
  onBan: (id: string, reason: string) => void;
  onUnban: (id: string) => void;
  onToggleAdmin: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

export function UsersTable({ users, onBan, onUnban, onToggleAdmin, onDelete }: UsersTableProps) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#0A0A0A] text-gray-400">
          <tr>
            <th className="p-3 text-left">User</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Joined</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-[#2A2A2A]">
              <td className="p-3">
                <div className="font-medium">{u.name || 'No name'}</div>
                <div className="text-gray-500 text-xs">{u.email}</div>
              </td>
              <td className="p-3">
                {u.is_admin && (
                  <span className="bg-[#C9A961] text-black text-xs px-2 py-1 rounded">Admin</span>
                )}
                {u.is_banned && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded ml-1">Banned</span>
                )}
              </td>
              <td className="p-3 text-gray-400 text-xs">
                {u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}
              </td>
              <td className="p-3">
                <div className="flex gap-2 justify-end">
                  {u.is_banned ? (
                    <button
                      onClick={() => onUnban(u.id)}
                      className="px-3 py-1 bg-green-600 text-xs rounded hover:bg-green-700"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => onBan(u.id, prompt('Ban reason:') || 'Violation')}
                      className="px-3 py-1 bg-red-600 text-xs rounded hover:bg-red-700"
                    >
                      Ban
                    </button>
                  )}
                  <button
                    onClick={() => onToggleAdmin(u.id, !!u.is_admin)}
                    className="px-3 py-1 bg-[#2A2A2A] text-xs rounded hover:bg-[#3A3A3A]"
                  >
                    {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => onDelete(u.id)}
                    className="px-3 py-1 bg-red-900 text-xs rounded hover:bg-red-800"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
