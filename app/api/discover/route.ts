import { NextResponse } from 'next/server';

export async function GET() {
  const hosts = [
    {
      id: '1',
      name: 'Ananya Gupta',
      age: 27,
      city: 'Mumbai',
      photos: [],
      standard: {
        id: 's1',
        name: 'Morning Routine',
        difficulty: 'easy',
        intentions: [
          { day: 1, description: 'Wake up at 6 AM and send a photo of your alarm' },
          { day: 2, description: 'Share your morning skincare routine' },
          { day: 3, description: 'Send a photo of your breakfast' },
        ],
      },
    },
    {
      id: '2',
      name: 'Arjun Nair',
      age: 31,
      city: 'Bangalore',
      photos: [],
      standard: {
        id: 's2',
        name: 'Fitness Challenge',
        difficulty: 'hard',
        intentions: [
          { day: 1, description: 'Send a photo at the gym' },
          { day: 2, description: 'Share your workout playlist' },
          { day: 3, description: 'Record a 30-second post-workout message' },
        ],
      },
    },
    {
      id: '3',
      name: 'Ishita Verma',
      age: 26,
      city: 'Delhi',
      photos: [],
      standard: {
        id: 's3',
        name: 'Book Lovers',
        difficulty: 'easy',
        intentions: [
          { day: 1, description: 'Share your current read' },
          { day: 2, description: 'Send a photo of your favorite reading spot' },
          { day: 3, description: 'Record a voice note about the book' },
        ],
      },
    },
    {
      id: '4',
      name: 'Vivaan Kapoor',
      age: 28,
      city: 'Pune',
      photos: [],
      standard: {
        id: 's4',
        name: 'Cooking Masters',
        difficulty: 'medium',
        intentions: [
          { day: 1, description: 'Share a photo of your kitchen setup' },
          { day: 2, description: 'Cook a dish and send the photo' },
          { day: 3, description: 'Share your secret ingredient' },
        ],
      },
    },
    {
      id: '5',
      name: 'Maya Joshi',
      age: 29,
      city: 'Hyderabad',
      photos: [],
      standard: {
        id: 's5',
        name: 'Photography Walk',
        difficulty: 'medium',
        intentions: [
          { day: 1, description: 'Take a photo of your street' },
          { day: 2, description: 'Capture a sunset' },
          { day: 3, description: 'Share your best click of the week' },
        ],
      },
    },
    {
      id: '6',
      name: 'Rohan Patel',
      age: 25,
      city: 'Chennai',
      photos: [],
      standard: {
        id: 's6',
        name: 'Mindfulness',
        difficulty: 'easy',
        intentions: [
          { day: 1, description: 'Share your meditation space' },
          { day: 2, description: 'Send a gratitude note' },
          { day: 3, description: 'Record a 1-minute breathing exercise' },
        ],
      },
    },
  ];

  return NextResponse.json({ hosts });
}
