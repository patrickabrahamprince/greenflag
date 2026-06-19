import { NextResponse } from 'next/server';

export async function GET() {
  const hosts = [
    { id: '1', name: 'Priya', age: 28, city: 'Mumbai', photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop'], interests: ['Reading', 'Wine', 'Travel'], active_test_id: 's1', difficulty: 'medium' },
    { id: '2', name: 'Ananya', age: 26, city: 'Delhi', photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop'], interests: ['Yoga', 'Photography', 'Music'], active_test_id: 's2', difficulty: 'hard' },
    { id: '3', name: 'Riya', age: 27, city: 'Bangalore', photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop'], interests: ['Art', 'Cooking', 'Travel'], active_test_id: 's3', difficulty: 'easy' },
    { id: '4', name: 'Neha', age: 29, city: 'Pune', photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop'], interests: ['Running', 'Coffee', 'Books'], active_test_id: 's4', difficulty: 'medium' },
    { id: '5', name: 'Kavya', age: 25, city: 'Hyderabad', photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop'], interests: ['Dance', 'Travel', 'Music'], active_test_id: 's5', difficulty: 'medium' },
    { id: '6', name: 'Ishita', age: 30, city: 'Chennai', photos: ['https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop'], interests: ['Wine', 'Art', 'Yoga'], active_test_id: 's6', difficulty: 'hard' },
  ];

  return NextResponse.json({ hosts });
}
