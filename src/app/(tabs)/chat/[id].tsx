import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const [connection, setConnection] = useState<any>(null);
    const [me, setMe] = useState<string | null>(null);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadChat();
    }, [id]);

    const loadChat = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setMe(user.id);

        const { data, error } = await supabase
            .from('connections')
            .select('*, initiator:profiles!initiator_id(*), receiver:profiles!receiver_id(*)')
            .eq('id', id)
            .single();

        if (data) {
            setConnection(data);
            if (data.initiator_id === user.id) {
                setOtherUser(data.receiver);
            } else {
                setOtherUser(data.initiator);
            }
        }
    };

    const handleSend = () => {
        if (!message.trim()) return;
        console.log('Sending message:', message);
        console.log('TODO: insert into messages table');
        setMessage('');
    };

    if (!otherUser) return (
        <View style={styles.container}>
            <Text style={{color: '#D4AF37', textAlign: 'center', marginTop: 100}}>Loading chat...</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.header}>
                <Image source={{ uri: otherUser.avatar_url || 'https://via.placeholder.com/100' }} style={styles.avatar} />
                <Text style={styles.headerName}>{otherUser.full_name}</Text>
            </View>

            <FlatList
                data={[]} // Messages stub
                renderItem={() => null}
                ListEmptyComponent={<Text style={styles.emptyText}>Say hi 👋</Text>}
                contentContainerStyle={styles.listContent}
                inverted
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Message..."
                    placeholderTextColor="#666"
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Ionicons name="send" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#222', paddingTop: 60 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    headerName: { color: '#fff', fontSize: 18, fontWeight: '600' },
    listContent: { flexGrow: 1, justifyContent: 'flex-end', padding: 16 },
    emptyText: { color: '#888', textAlign: 'center', marginTop: 40, fontSize: 16 },
    inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#222', alignItems: 'center', paddingBottom: 30 },
    input: { flex: 1, backgroundColor: '#111', color: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 12, fontSize: 16 },
    sendButton: { backgroundColor: '#D4AF37', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
