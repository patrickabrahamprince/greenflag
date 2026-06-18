'use client';

import React, { useState } from 'react';

function ToggleCard({ flag, label, description, critical }: { flag: any; label: string; description: string; critical?: boolean }) {
  const [value, setValue] = useState<boolean>(flag.value);

  async function handleToggle() {
    const newVal = !value;
    setValue(newVal);
    await fetch('/api/admin/kill-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag: flag.key, value: newVal }),
    });
    window.location.reload();
  }

  return (
    <div
      className={`p-6 rounded-lg shadow-sm border ${critical ? 'bg-red-100 border-red-200' : 'bg-white border-gray-200'} `}
    >
      <h3 className="text-lg font-medium mb-2 text-gray-950">{label}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button
        className={`px-4 py-2 rounded text-sm font-semibold transition ${
          value ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
        }`}
        onClick={handleToggle}
      >
        {value ? 'Enabled' : 'Disabled'}
      </button>
      {critical && !value && (
        <p className="mt-2 text-red-700 font-semibold">{label.toUpperCase()} OFF</p>
      )}
    </div>
  );
}

export default function KillSwitchesClient({ initialFlags }: { initialFlags: any[] }) {
  const flagMap: Record<string, { label: string; description: string; critical?: boolean }> = {
    signups_enabled: {
      label: 'Disable Signups',
      description: 'Blocks /api/auth/send-otp. Shows "Join waitlist" to users.',
    },
    submissions_enabled: {
      label: 'Disable Submissions',
      description: "Blocks /api/submissions/create. Men can't submit proofs.",
    },
    new_matches_enabled: {
      label: 'Pause New Matches',
      description: 'Blocks /api/connections/start. Existing matches continue.',
    },
    maintenance_mode: {
      label: 'Maintenance Mode',
      description: 'Shows "Be right back" to all users. Only admins can access.',
      critical: true,
    },
  };

  return (
    <section className="p-6 bg-gray-100 min-h-screen text-gray-900">
      <h1 className="text-2xl font-bold mb-6">Kill Switches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialFlags.map((flag: any) => {
          const cfg = flagMap[flag.key];
          if (!cfg) return null;
          return (
            <ToggleCard
              key={flag.key}
              flag={flag}
              label={cfg.label}
              description={cfg.description}
              critical={cfg.critical}
            />
          );
        })}
      </div>
    </section>
  );
}
