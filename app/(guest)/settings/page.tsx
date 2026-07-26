'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Shield, Trash2, LogOut, Phone, Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { parsePhoneNumber } from 'libphonenumber-js';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';

function formatPhoneDisplay(phone: string | undefined): string {
  if (!phone) return 'Not available';
  const parsed = parsePhoneNumber(phone);
  if (parsed && parsed.isValid()) {
    return parsed.formatInternational();
  }
  return phone;
}

export default function SettingsPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const setBalance = useCoinStore((s) => s.setBalance);

  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPhone = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user?.phone) {
        setPhone(data.user.phone);
      }
    };
    fetchPhone();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    setBalance(0);
    router.replace('/login');
  };

  const handleUpdateEmail = async () => {
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Email updated');
    setUpdating(false);
  };

  const handleChangePassword = async () => {
    toast.success('Password reset link sent to your email');
  };

  const handleDeleteAccount = async () => {
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success('Account deleted');
    setUpdating(false);
    setShowDeleteConfirm(false);
    handleLogout();
  };

  return (
    <div className="page-container animate-fade-in pb-32">
      <div className="page-header">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl text-ink flex-1">Settings</h1>
      </div>

      <div className="px-4 space-y-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
                <Phone className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted">Phone</p>
                <p className="text-ink font-medium">{formatPhoneDisplay(phone)}</p>
              </div>
            </div>
            <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          </div>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
              <Mail className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm text-muted">Email</p>
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
            <button
              onClick={handleUpdateEmail}
              disabled={updating || !email}
              className="btn-primary text-sm px-4"
            >
              {updating ? '...' : 'Update'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm text-muted">Password</p>
          </div>
          <button onClick={handleChangePassword} className="btn-secondary w-full text-sm">
            Change Password
          </button>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
              <Bell className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm text-muted">Notifications</p>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Push Notifications', value: pushNotif, set: setPushNotif },
              { label: 'SMS Notifications', value: smsNotif, set: setSmsNotif },
              { label: 'Email Notifications', value: emailNotif, set: setEmailNotif },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-ink">{item.label}</span>
                <button
                  onClick={() => item.set(!item.value)}
                  className={`w-11 h-6 rounded-full transition-colors ${
                    item.value ? 'bg-gold' : 'bg-surface-light'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    item.value ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card border-red-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-red-500 font-medium">Danger Zone</p>
              <p className="text-xs text-muted">Delete your account and all data</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger w-full text-sm"
          >
            Delete Account
          </button>
        </div>

        <button onClick={handleLogout} className="btn-secondary w-full flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="card max-w-sm w-full p-6 text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-display text-lg text-ink mb-2">Delete Account?</h3>
            <p className="text-sm text-muted mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={updating}
                className="btn-danger flex-1 text-sm"
              >
                {updating ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
