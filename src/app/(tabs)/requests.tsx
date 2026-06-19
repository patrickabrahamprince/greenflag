/*
-- Update accept_connection function:
-- create or replace function accept_connection(connection_id uuid) returns void as $$
-- begin
--   update connections set status = 'accepted' where id = connection_id and receiver_id = auth.uid();
--   -- return both user IDs so client can navigate
-- end; $$ language plpgsql security definer;
-- Note: After updating, change RPC to return table: create or replace function accept_connection(connection_id uuid) returns table(initiator_id uuid, receiver_id uuid)
*/
import { supabase } from '@/lib/supabase'
import { Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View, Modal, Image } from 'react-native'
import Swiper from 'react-native-deck-swiper'
import { useRouter } from 'expo-router'

const { width, height } = Dimensions.get('screen')

export default function RequestsScreen() {
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [matchData, setMatchData] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        let channel;
        const setup = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            await fetchRequests(user.id)

            channel = supabase.channel('connections').on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'connections', 
                filter: `receiver_id=eq.${user.id}` 
            }, (payload) => { 
                setCards(prev => [payload.new, ...prev]) 
            }).subscribe()
        }
        
        setup()

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [])

    const fetchRequests = async (userId) => {
        console.log('Current user:', userId)

        const { data } = await supabase
            .from('connections')
            .select(`
        id,
        created_at,
        initiator:profiles!initiator_id(
          id,
          full_name,
          avatar_url,
          age,
          bio,
          profession
        )
      `)
            .eq('receiver_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        console.log('Fetched requests:', data)

        setCards(data || [])
        setLoading(false)
    }

    const handleAccept = async (cardIndex) => {
        const connection = cards[cardIndex]
        const { data, error } = await supabase.rpc('accept_connection', { connection_id: connection.id })
        
        if (error) {
            console.log('Accept connection RPC error:', error)
        } else {
            // Check if RPC was updated to return initiator_id / recipient_id
            let initiatorData = connection.initiator;
            
            setMatchData({ 
                otherUser: initiatorData, 
                connectionId: connection.id 
            })
        }
        
        setCards(prev => prev.filter((_, i) => i !== cardIndex))
    }

    const handleDecline = async (cardIndex) => {
        const connection = cards[cardIndex]
        const { error } = await supabase.rpc('decline_connection', { connection_id: connection.id })
        if (error) console.log('Decline connection RPC error:', error)
        setCards(prev => prev.filter((_, i) => i !== cardIndex))
    }

    const Card = ({ card }) => {
        const initiator = card.initiator || { full_name: 'Someone New', profession: 'Hidden', bio: 'Swipe to find out more!' };
        
        return (
            <View style={styles.card}>
                <ImageBackground
                    source={{ uri: initiator.avatar_url || 'https://via.placeholder.com/400' }}
                    style={styles.cardImage}
                    imageStyle={{ borderRadius: 24 }}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={styles.gradient}
                    >
                        <View style={styles.cardContent}>
                            <Text style={styles.name}>
                                {initiator.full_name}, {initiator.age || 25}
                            </Text>
                            <Text style={styles.profession}>{initiator.profession || 'Professional'}</Text>
                            <Text style={styles.bio} numberOfLines={2}>{initiator.bio || 'No bio yet'}</Text>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </View>
        )
    }

    if (loading) return (
        <View style={styles.container}>
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    )

    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)' }]} /> : <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />}

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Requests</Text>
                <Text style={styles.headerSubtitle}>{cards.length} pending</Text>
            </View>

            {cards.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-dislike-outline" size={64} color="#666" />
                    <Text style={styles.emptyTitle}>No requests yet</Text>
                    <Text style={styles.emptyText}>When someone hits Begin on your profile, they'll appear here</Text>
                </View>
            ) : (
                <Swiper
                    cards={cards}
                    renderCard={(card) => <Card card={card} />}
                    onSwipedRight={(cardIndex) => handleAccept(cardIndex)}
                    onSwipedLeft={(cardIndex) => handleDecline(cardIndex)}
                    cardIndex={0}
                    backgroundColor="transparent"
                    stackSize={3}
                    stackSeparation={15}
                    animateOverlayLabelsOpacity
                    animateCardOpacity
                    overlayLabels={{
                        left: {
                            title: 'PASS',
                            style: { label: styles.overlayLabel, wrapper: styles.overlayWrapper }
                        },
                        right: {
                            title: 'CONNECT',
                            style: { label: [styles.overlayLabel, { color: '#4ADE80', borderColor: '#4ADE80' }], wrapper: styles.overlayWrapper }
                        }
                    }}
                />
            )}

            {cards.length > 0 && (
                <View style={styles.buttons}>
                    <TouchableOpacity style={[styles.button, styles.declineButton]} onPress={() => handleDecline(0)}>
                        <Ionicons name="close" size={32} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={() => handleAccept(0)}>
                        <Ionicons name="heart" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

            {matchData && (
                <Modal visible transparent animationType="fade">
                    <BlurView intensity={100} tint="dark" style={styles.modalContainer}>
                        <Text style={styles.matchTitle}>It's a Match!</Text>
                        <View style={styles.avatarsContainer}>
                            <Image source={{ uri: matchData.otherUser?.avatar_url || 'https://via.placeholder.com/400' }} style={styles.matchAvatar} />
                        </View>
                        <TouchableOpacity style={styles.matchButton} onPress={() => {
                            const id = matchData.connectionId;
                            setMatchData(null);
                            router.push(`/(tabs)/chat/${id}`);
                        }}>
                            <Text style={styles.matchButtonText}>Send Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.keepSwipingButton} onPress={() => setMatchData(null)}>
                            <Text style={styles.keepSwipingText}>Keep Swiping</Text>
                        </TouchableOpacity>
                    </BlurView>
                </Modal>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loadingText: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 100 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '600', marginTop: 16 },
    emptyText: { color: '#8E8E93', fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 },
    headerTitle: { fontSize: 34, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 15, color: '#8E8E93', marginTop: 4 },
    card: { height: height * 0.65, borderRadius: 24, boxShadow: '0px 8px 16px rgba(0,0,0,0.4)' },
    cardImage: { flex: 1, justifyContent: 'flex-end' },
    gradient: { borderRadius: 24, padding: 24 },
    cardContent: { gap: 4 },
    name: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
    profession: { fontSize: 16, color: '#E5E5EA', marginBottom: 8 },
    bio: { fontSize: 15, color: '#D1D1D6', lineHeight: 20 },
    buttons: { flexDirection: 'row', justifyContent: 'center', gap: 40, paddingBottom: 40, paddingTop: 20, zIndex: -1 },
    button: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 8px rgba(0,0,0,0.3)' },
    declineButton: { backgroundColor: '#FF3B30' },
    acceptButton: { backgroundColor: '#34C759' },
    overlayLabel: { fontSize: 45, fontWeight: 'bold', color: '#FF3B30', borderWidth: 4, borderColor: '#FF3B30', padding: 10, borderRadius: 10 },
    overlayWrapper: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    
    // Match Modal Styles
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.7)' },
    matchTitle: { fontSize: 48, fontWeight: '800', color: '#D4AF37', marginBottom: 40, fontStyle: 'italic', letterSpacing: -1 },
    avatarsContainer: { flexDirection: 'row', gap: 20, marginBottom: 50 },
    matchAvatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#D4AF37' },
    matchButton: { backgroundColor: '#D4AF37', width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginBottom: 16 },
    matchButtonText: { color: '#000', fontSize: 18, fontWeight: '700' },
    keepSwipingButton: { width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37' },
    keepSwipingText: { color: '#D4AF37', fontSize: 18, fontWeight: '600' },
})