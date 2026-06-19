/*
-- RUN IN SUPABASE SQL EDITOR BEFORE DEPLOY:
-- alter table profiles add column if not exists is_admin boolean default false;
-- alter table profiles add column if not exists coins int default 10;
-- alter table profiles enable row level security;
-- alter table connections enable row level security;
-- create policy "profiles_read_all" on profiles for select using (true);
-- create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
-- create policy "connections_read_own" on connections for select using (auth.uid() = receiver_id OR auth.uid() = initiator_id);
-- create policy "connections_insert_auth" on connections for insert with check (auth.uid() = initiator_id);
-- create policy "connections_update_receiver" on connections for update using (auth.uid() = receiver_id);
-- grant execute on function begin_connection to authenticated;
-- grant execute on function accept_connection to authenticated;
-- update profiles set is_admin = true where email = 'SET_YOUR_EMAIL_HERE';
*/
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'Users' | 'Connections'>('Users');
  const [users, setUsers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);
    const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    setIsAdmin(data?.is_admin || false);
    setLoading(false);
    if (data?.is_admin) fetchData();
  };

  const fetchData = async () => {
    const { data: u } = await supabase.from('profiles').select('id, email, full_name, coins, created_at').order('created_at', { ascending: false }).limit(100);
    const { data: c } = await supabase.from('connections').select('*, initiator:profiles!initiator_id(email), receiver:profiles!receiver_id(email)').order('created_at', { ascending: false }).limit(100);
    setUsers(u || []);
    setConnections(c || []);
  };

  const addCoins = async (userId: string, current: number) => {
    await supabase.from('profiles').update({ coins: current + 10 }).eq('id', userId);
    fetchData();
    Alert.alert('Success', 'Added 10 coins');
  };

  if (loading) return <View style={s.bg}><Text style={s.text}>Loading...</Text></View>;
  if (!isAdmin) return <View style={s.bg}><Text style={s.text}>Unauthorized</Text></View>;

  return (
    <View style={s.bg}>
      <Text style={s.header}>Greenflag Admin</Text>
      <View style={s.tabs}>
        <TouchableOpacity onPress={() => setTab('Users')}><Text style={[s.tab, tab === 'Users' && s.tabActive]}>Users</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('Connections')}><Text style={[s.tab, tab === 'Connections' && s.tabActive]}>Connections</Text></TouchableOpacity>
      </View>
      {tab === 'Users' && <FlatList data={users} keyExtractor={i => i.id} renderItem={({ item }) => (
        <View style={s.row}>
          <Text style={s.text}>{item.full_name || item.email} | Coins: {item.coins}</Text>
          <TouchableOpacity onPress={() => addCoins(item.id, item.coins)}><Text style={s.btn}>+10 Coins</Text></TouchableOpacity>
        </View>
      )} />}
      {tab === 'Connections' && <FlatList data={connections} keyExtractor={i => i.id} renderItem={({ item }) => (
        <View style={s.row}><Text style={s.text}>{item.initiator?.email} → {item.receiver?.email} | {item.status}</Text></View>
      )} />}
    </View>
  );
}
const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000', padding: 20 },
  header: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold', marginBottom: 20, paddingTop: 40 },
  text: { color: '#fff' },
  tabs: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  tab: { color: '#888', fontSize: 16 },
  tabActive: { color: '#D4AF37', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  btn: { color: '#D4AF37' }
});
