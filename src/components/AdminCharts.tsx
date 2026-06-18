'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface AdminChartsProps {
  signupChartData: { date: string; count: number }[];
  submissionChartData: { status: string; count: number }[];
}

export default function AdminCharts({ signupChartData, submissionChartData }: AdminChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 text-gray-900">
        <div className="bg-white shadow-sm rounded-lg p-6 h-[340px] flex items-center justify-center border border-gray-200 animate-pulse">
          <p className="text-gray-400 text-sm">Loading signups chart...</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-6 h-[340px] flex items-center justify-center border border-gray-200 animate-pulse">
          <p className="text-gray-400 text-sm">Loading submissions chart...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 text-gray-900">
      <div className="bg-white shadow-sm rounded-lg p-4 flex flex-col items-center">
        <h4 className="text-lg font-medium mb-4 self-start text-gray-900">Signups Last 7 Days</h4>
        <div className="w-full overflow-x-auto flex justify-center">
          <LineChart width={480} height={280} data={signupChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} />
          </LineChart>
        </div>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-4 flex flex-col items-center">
        <h4 className="text-lg font-medium mb-4 self-start text-gray-900">Submissions by Status</h4>
        <div className="w-full overflow-x-auto flex justify-center">
          <BarChart width={480} height={280} data={submissionChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
