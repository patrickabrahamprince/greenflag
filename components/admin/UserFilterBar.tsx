'use client';

import { Search } from 'lucide-react';

export interface UserFilterBarProps {
  search: string;
  gender: string;
  status: string;
  onSearchChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function UserFilterBar({
  search,
  gender,
  status,
  onSearchChange,
  onGenderChange,
  onStatusChange,
}: UserFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          className="input pl-10"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select
        className="input max-w-[130px]"
        value={gender}
        onChange={(e) => onGenderChange(e.target.value)}
      >
        <option value="">All genders</option>
        <option value="woman">Woman</option>
        <option value="man">Man</option>
      </select>
      <select
        className="input max-w-[130px]"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">All status</option>
        <option value="active">Active</option>
        <option value="banned">Paused</option>
        <option value="pending">Pending approval</option>
      </select>
    </div>
  );
}
