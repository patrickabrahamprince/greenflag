'use client';

import { useState, useEffect } from 'react';
import { Eye, PauseCircle, Trash2, Flag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface FlaggedTest {
  id: string;
  host: string;
  name: string;
  reports: number;
}

export default function AdminTests() {
  const [tests, setTests] = useState<FlaggedTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchFlagged = async () => {
      const { data, error } = await supabase
        .from('standards')
        .select('id, name, host_id, profiles:host_id(name)')
        .eq('is_flagged', true);

      if (!error && data) {
        setTests(data.map((t: any) => ({
          id: t.id,
          host: t.profiles?.name || 'Unknown',
          name: t.name,
          reports: t.report_count || 0,
        })));
      }
      setLoading(false);
    };

    fetchFlagged();
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-white mb-6">Flagged Standards</h1>

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : tests.length === 0 ? (
        <div className="empty-state py-16">
          <div className="empty-state-icon">
            <Flag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No flagged standards</h3>
          <p className="text-muted text-sm">Flagged standards will appear here for review.</p>
        </div>
      ) : (
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
              {tests.map((test) => (
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
      )}
    </div>
  );
}
