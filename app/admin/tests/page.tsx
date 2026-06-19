'use client';

import { Eye, PauseCircle, Trash2 } from 'lucide-react';

const MOCK_TESTS = [
  { id: '1', host: 'Ananya Gupta', name: 'Morning Routine', reports: 3 },
  { id: '2', host: 'Arjun Nair', name: 'Fitness Challenge', reports: 1 },
  { id: '3', host: 'Ishita Verma', name: 'Book Lovers', reports: 5 },
  { id: '4', host: 'Vivaan Kapoor', name: 'Cooking Masters', reports: 2 },
];

export default function AdminTests() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-white mb-6">Flagged Standards</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs uppercase border-b border-border">
              <th className="text-left py-3 px-2">Host</th>
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Reports</th>
              <th className="text-right py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TESTS.map((test) => (
              <tr key={test.id} className="border-b border-border/50">
                <td className="py-3 px-2 text-white font-medium">{test.host}</td>
                <td className="py-3 px-2 text-muted">{test.name}</td>
                <td className="py-3 px-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    test.reports >= 3 ? 'bg-red-500/10 text-red-500' : 'bg-gold/10 text-gold'
                  }`}>
                    {test.reports}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1 justify-end">
                    <button className="btn-ghost text-xs p-1.5">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn-ghost text-xs p-1.5 text-gold">
                      <PauseCircle className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn-ghost text-xs p-1.5 text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
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
