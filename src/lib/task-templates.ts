export type TaskTemplate = {
  title: string;
  instruction: string;
  time_estimate: '2 min' | '5 min' | '15 min';
  verification_method: 'photo' | 'voice' | 'video' | 'location';
  day_preference?: 1 | 5 | 8;
  category: 'intro' | 'effort' | 'vibe' | 'consistency';
}

export const TASK_BANK: Record<string, TaskTemplate[]> = {
  'Consistent': [
    { title: 'Send me a selfie between 6-9am today', instruction: 'Natural light, no filter. Shows you’re up early.', time_estimate: '2 min', verification_method: 'photo', day_preference: 1, category: 'consistency' },
    { title: 'Screenshot your steps. Hit 8k before 8pm', instruction: 'Apple Health or Google Fit. Must show today’s date.', time_estimate: '2 min', verification_method: 'photo', category: 'consistency' },
    { title: 'Voice note: What habit have you kept for 30+ days?', instruction: '45 seconds. How did you start it? Why do you stick with it?', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'consistency' },
    { title: 'Send me gym selfies for 3 days this week', instruction: 'One per day. Different outfits. Shows you show up.', time_estimate: '5 min', verification_method: 'photo', category: 'consistency' },
    { title: 'Video: Say today’s date and 1 thing you’ll finish today', instruction: '15 seconds. Record it now. Shows accountability.', time_estimate: '2 min', verification_method: 'video', day_preference: 8, category: 'consistency' }
  ],

  'Plans Dates': [
    { title: 'Send me 3 coffee spots near me with a screenshot', instruction: 'Google Maps list. Pick your favorite and tell me why in 1 sentence.', time_estimate: '5 min', verification_method: 'photo', day_preference: 1, category: 'effort' },
    { title: 'Voice note: Plan our first 3-hour meet. No dinner.', instruction: '60 seconds. Specific time, place, activity. What’s plan B if it rains?', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'effort' },
    { title: 'Screenshot a Zomato/OpenTable booking for coffee', instruction: 'Book for next week. Doesn’t have to be with me. Shows initiative.', time_estimate: '5 min', verification_method: 'photo', category: 'effort' },
    { title: 'Handwrite a budget for a date under ₹1000 and photo it', instruction: 'List activity, coffee, travel. Show total. Your handwriting for proof.', time_estimate: '15 min', verification_method: 'photo', day_preference: 8, category: 'effort' },
    { title: 'Send me a location pin for where we’d meet first', instruction: 'Drop pin in WhatsApp, screenshot it. Must be public place, daytime.', time_estimate: '2 min', verification_method: 'photo', category: 'effort' }
  ],

  'Takes Initiative': [
    { title: 'Text me your plan for this Saturday by 6pm', instruction: 'Voice note 30s or text screenshot. No “what do you want to do”. You decide.', time_estimate: '5 min', verification_method: 'voice', day_preference: 1, category: 'effort' },
    { title: 'Send me a problem you solved this week at work', instruction: 'Voice note 45s. No company names. Show me how you think.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'effort' },
    { title: 'Photo: Something you started without being asked', instruction: 'Project, chore, idea. Show before/after or progress. Prove it was your call.', time_estimate: '15 min', verification_method: 'photo', day_preference: 8, category: 'effort' },
    { title: 'Book a slot for us and screenshot confirmation', instruction: 'Anything: pottery, comedy show, walk. Must show date/time booked.', time_estimate: '5 min', verification_method: 'photo', category: 'effort' },
    { title: 'Voice note: Pitch me on why we should meet', instruction: '60 seconds. No pickup lines. What’s your value?', time_estimate: '5 min', verification_method: 'voice', category: 'vibe' }
  ],

  'Puts In Effort': [
    { title: 'Handwrite a note about why you applied and photo it', instruction: '3 sentences. Your handwriting. Shows you’re not copy-pasting.', time_estimate: '5 min', verification_method: 'photo', day_preference: 1, category: 'effort' },
    { title: 'Voice note: Read my Standard bio back to me', instruction: '30 seconds. Prove you actually read it vs skimmed.', time_estimate: '2 min', verification_method: 'voice', category: 'effort' },
    { title: 'Send me a custom meme about my bio', instruction: 'Use Canva or meme generator. Must reference 1 thing from my profile.', time_estimate: '15 min', verification_method: 'photo', day_preference: 8, category: 'effort' },
    { title: 'Photo: Dress up for a video call. Just for this task', instruction: 'Shirt, decent background. Shows you try. No gym clothes.', time_estimate: '5 min', verification_method: 'photo', category: 'effort' },
    { title: 'Voice note: 3 questions you’d ask me on our first meet', instruction: '45 seconds. No “what’s your type”. Be curious.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'effort' }
  ],

  'Good Communicator': [
    { title: 'Voice note: Tell me about your day in 45 seconds', instruction: 'No “it was good”. Give me 1 high, 1 low, 1 learning.', time_estimate: '5 min', verification_method: 'voice', day_preference: 1, category: 'vibe' },
    { title: 'Text me and screenshot it. No “hey” allowed', instruction: 'Open with something specific from my bio. Screenshot before sending.', time_estimate: '2 min', verification_method: 'photo', category: 'effort' },
    { title: 'Voice note: How do you handle conflict?', instruction: '60 seconds. Give 1 real example without names. What did you learn?', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Video: Explain a complex topic simply in 30s', instruction: 'Your job, hobby, anything. Talk to me like I’m 5.', time_estimate: '5 min', verification_method: 'video', category: 'vibe' },
    { title: 'Voice note: Apologize for something small from last week', instruction: '30 seconds. Shows self-awareness. Can be to anyone.', time_estimate: '2 min', verification_method: 'voice', day_preference: 8, category: 'effort' }
  ],

  'Follows Through': [
    { title: 'Voice note: State 1 thing you’ll do tomorrow', instruction: '30 seconds. I’ll ask for proof in 48h as next task.', time_estimate: '2 min', verification_method: 'voice', day_preference: 1, category: 'consistency' },
    { title: 'Photo: Proof you did yesterday’s task', instruction: 'Whatever you promised. Show me. No excuses.', time_estimate: '5 min', verification_method: 'photo', category: 'consistency' },
    { title: 'Screenshot: You set a reminder for our chat', instruction: 'Calendar or Reminders app. Must show date/time + my name.', time_estimate: '2 min', verification_method: 'photo', category: 'effort' },
    { title: 'Send me your completed to-do list from today', instruction: 'Notes app or paper. Cross 3+ items off. Shows execution.', time_estimate: '5 min', verification_method: 'photo', day_preference: 5, category: 'consistency' },
    { title: 'Video: Show me your workspace at 9am sharp', instruction: '15 seconds. Must be timestamped. Proves you start on time.', time_estimate: '2 min', verification_method: 'video', day_preference: 8, category: 'consistency' }
  ],

  'Detail Oriented': [
    { title: 'Send me 3 details you noticed in my photos', instruction: 'Text or voice note 30s. Not “you’re pretty”. Be specific.', time_estimate: '5 min', verification_method: 'voice', day_preference: 1, category: 'effort' },
    { title: 'Photo: Your desk organized. Show alignment', instruction: 'Cables managed, pens parallel. Shows care.', time_estimate: '5 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Voice note: Spell my name and recall 1 line from bio', instruction: '30 seconds. Proves you read vs skim.', time_estimate: '2 min', verification_method: 'voice', category: 'effort' },
    { title: 'Send me a corrected version of my bio with 1 typo fix', instruction: 'Screenshot with markup. Even if no typo, find something to improve.', time_estimate: '5 min', verification_method: 'photo', day_preference: 5, category: 'effort' },
    { title: 'Video: Fold a shirt perfectly in under 15s', instruction: 'Shows attention to small things. I’ll judge the corners.', time_estimate: '2 min', verification_method: 'video', day_preference: 8, category: 'effort' }
  ],

  'Emotionally Mature': [
    { title: 'Voice note: 3 things you’re grateful for today', instruction: '30 seconds. No generic “family”. Be specific.', time_estimate: '2 min', verification_method: 'voice', day_preference: 1, category: 'vibe' },
    { title: 'Voice note: Tell me about a time you were wrong', instruction: '60 seconds. What did you do? What did you learn?', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Handwrite a boundary you set recently and photo it', instruction: '3 sentences. Your handwriting. Shows self-respect.', time_estimate: '15 min', verification_method: 'photo', day_preference: 8, category: 'effort' },
    { title: 'Voice note: What did therapy or a book teach you?', instruction: '45 seconds. 1 insight about yourself. Be vulnerable.', time_estimate: '5 min', verification_method: 'voice', category: 'vibe' },
    { title: 'Photo: Screenshot your Screen Time for today', instruction: 'Must be under 3 hours social. Proves you have a life offline.', time_estimate: '2 min', verification_method: 'photo', category: 'consistency' }
  ],

  'Loyal': [
    { title: 'Photo: Your longest friendship. Show proof', instruction: 'Old photo together or text screenshot. Cover names. Shows you keep people.', time_estimate: '5 min', verification_method: 'photo', day_preference: 1, category: 'vibe' },
    { title: 'Voice note: What does loyalty mean to you?', instruction: '45 seconds. Give 1 example of when you showed it.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Send me a screenshot of your call log with mom/dad', instruction: 'Last 7 days. Shows you check in. Blur numbers.', time_estimate: '2 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Photo: Something you’ve owned for 5+ years', instruction: 'Watch, book, jacket. Shows you don’t discard things.', time_estimate: '2 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Voice note: Tell me about a promise you kept', instruction: '60 seconds. Even if it was hard. Shows integrity.', time_estimate: '5 min', verification_method: 'voice', day_preference: 8, category: 'effort' }
  ],

  'Kind': [
    { title: 'Photo: Something kind you did today', instruction: 'Helped someone, tipped well, fed a dog. Show proof.', time_estimate: '5 min', verification_method: 'photo', day_preference: 1, category: 'vibe' },
    { title: 'Voice note: Compliment me without mentioning looks', instruction: '30 seconds. Based on my bio only. Shows you see me.', time_estimate: '2 min', verification_method: 'voice', category: 'effort' },
    { title: 'Screenshot: A kind text you sent someone this week', instruction: 'To friend, family, colleague. Blur names. Proves you’re thoughtful.', time_estimate: '2 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Voice note: How do you treat waitstaff?', instruction: '45 seconds. Give example. I watch how you treat everyone.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Video: Say thank you to someone and record it', instruction: '15 seconds. Can be barista, guard, anyone. Shows gratitude.', time_estimate: '5 min', verification_method: 'video', day_preference: 8, category: 'effort' }
  ],

  'Honest': [
    { title: 'Voice note: Tell me one lie you told this week', instruction: '30 seconds. Even white lies. Shows self-awareness.', time_estimate: '2 min', verification_method: 'voice', day_preference: 1, category: 'vibe' },
    { title: 'Screenshot your dating app. Are you talking to others?', instruction: 'Yes or no with proof. I respect honesty over games.', time_estimate: '2 min', verification_method: 'photo', category: 'intro' },
    { title: 'Voice note: What’s one thing you’re insecure about?', instruction: '45 seconds. Vulnerability > perfection.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Photo: Your room messy. No cleaning first', instruction: 'Real you. Shows you don’t catfish with lifestyle.', time_estimate: '2 min', verification_method: 'photo', category: 'intro' },
    { title: 'Video: Tell me something unpopular you believe', instruction: '30 seconds. Own it. Shows you don’t people-please.', time_estimate: '5 min', verification_method: 'video', day_preference: 8, category: 'effort' }
  ],

  'Self Aware': [
    { title: 'Voice note: What’s your biggest flaw in relationships?', instruction: '45 seconds. No “I care too much”. Be real.', time_estimate: '5 min', verification_method: 'voice', day_preference: 1, category: 'vibe' },
    { title: 'Send me your last 3 Spotify songs. Explain one', instruction: 'Screenshot + 30s voice note. Shows what you consume.', time_estimate: '5 min', verification_method: 'voice', category: 'vibe' },
    { title: 'Photo: Screenshot your most used app this week', instruction: 'Screen Time. Tells me where your attention goes.', time_estimate: '2 min', verification_method: 'photo', category: 'intro' },
    { title: 'Voice note: What advice would your ex give me?', instruction: '60 seconds. Brutal honesty. Shows growth.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Handwrite your attachment style and photo it', instruction: '3 sentences. Anxious, avoidant, secure? Why?', time_estimate: '15 min', verification_method: 'photo', day_preference: 8, category: 'effort' }
  ],

  'Respects Boundaries': [
    { title: 'Text me asking before you call. Screenshot it', instruction: 'Shows you respect time. Don’t actually call yet.', time_estimate: '2 min', verification_method: 'photo', day_preference: 1, category: 'effort' },
    { title: 'Voice note: What’s one boundary you have?', instruction: '45 seconds. Time, space, digital. Tell me so I know.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Send me a “good night” at 10pm. Not 2am', instruction: 'Screenshot timestamp. Proves you respect sleep.', time_estimate: '2 min', verification_method: 'photo', category: 'consistency' },
    { title: 'Photo: Your phone on DND mode', instruction: 'Shows you can disconnect. Healthy boundaries.', time_estimate: '2 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Voice note: Tell me about a time you said no', instruction: '60 seconds. To friend, boss, family. Shows backbone.', time_estimate: '5 min', verification_method: 'voice', day_preference: 8, category: 'effort' }
  ],

  'No Players': [
    { title: 'Screenshot: Delete other dating apps. Show proof', instruction: 'App Library or Play Store. Shows focus.', time_estimate: '2 min', verification_method: 'photo', day_preference: 1, category: 'intro' },
    { title: 'Voice note: Why are you single?', instruction: '45 seconds. No “haven’t met the one”. Be specific.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Send me your Instagram following count', instruction: 'Screenshot. If >1000, explain why. Shows intent.', time_estimate: '2 min', verification_method: 'photo', category: 'intro' },
    { title: 'Photo: Your last weekend. Was it with guys or girls?', instruction: 'Group pic or solo. Shows your circle.', time_estimate: '5 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Video: Look me in eyes, say you’re not talking to others', instruction: '15 seconds. If you are, just say it. Honesty > games.', time_estimate: '2 min', verification_method: 'video', day_preference: 8, category: 'effort' }
  ],

  'No Ghosting': [
    { title: 'Voice note: Send me a check-in every morning for 3 days', instruction: 'Just “good morning” + 1 sentence. Submit day 3. Shows reliability.', time_estimate: '2 min', verification_method: 'voice', day_preference: 1, category: 'consistency' },
    { title: 'Screenshot: You replied to a text within 2 hours', instruction: 'Any text. Shows you’re responsive. No leaving on read.', time_estimate: '2 min', verification_method: 'photo', category: 'consistency' },
    { title: 'Voice note: What’s your texting style?', instruction: '45 seconds. Dry, emojis, voice notes? Tell me so I know.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Video: Tell me if you lose interest, don’t ghost', instruction: '15 seconds. Make the promise to camera.', time_estimate: '2 min', verification_method: 'video', day_preference: 8, category: 'effort' },
    { title: 'Photo: Your phone battery at 8pm', instruction: 'If <20%, text me before it dies. Shows consideration.', time_estimate: '2 min', verification_method: 'photo', category: 'consistency' }
  ],

  'Driven': [
    { title: 'Photo: Your workspace at 9am Monday', instruction: 'Desk, laptop open. Shows you start strong.', time_estimate: '2 min', verification_method: 'photo', day_preference: 1, category: 'intro' },
    { title: 'Voice note: What’s one goal you’ll hit in 90 days?', instruction: '45 seconds. Must have numbers. “Get fit” = fail.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Screenshot: Your calendar for this week', instruction: 'Blur private stuff. Shows you’re busy with purpose.', time_estimate: '2 min', verification_method: 'photo', category: 'intro' },
    { title: 'Photo: A book on business/self-dev you’re reading', instruction: 'Show cover. Not Atomic Habits. Something deeper.', time_estimate: '2 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Voice note: Pitch me your 5-year plan in 60s', instruction: 'Where will you be? Shows ambition.', time_estimate: '5 min', verification_method: 'voice', day_preference: 8, category: 'effort' }
  ],

  'Reads Books': [
    { title: 'Photo: What book is on your bedside right now?', instruction: 'Show cover. Not ebook screenshot. Real book.', time_estimate: '2 min', verification_method: 'photo', day_preference: 1, category: 'intro' },
    { title: 'Voice note: Read me your favorite paragraph', instruction: '45 seconds from any book. Show me what moves you.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Photo: Your bookshelf or Kindle library', instruction: 'Shows taste. 5+ books visible.', time_estimate: '2 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Voice note: Recommend me 1 book based on my bio', instruction: '45 seconds. Why would I like it?', time_estimate: '5 min', verification_method: 'voice', category: 'effort' },
    { title: 'Handwrite a quote that changed you and photo it', instruction: 'On paper, your handwriting. Shows it mattered.', time_estimate: '15 min', verification_method: 'photo', day_preference: 8, category: 'effort' }
  ],

  'Gym Partner': [
    { title: 'Send me a gym selfie with today’s date showing', instruction: 'Phone lockscreen or gym clock visible. Proves you went.', time_estimate: '2 min', verification_method: 'photo', day_preference: 1, category: 'consistency' },
    { title: 'Voice note: What did you train today? How do you feel?', instruction: '30 seconds, right after workout. Real talk.', time_estimate: '2 min', verification_method: 'voice', category: 'vibe' },
    { title: 'Video: 10 seconds of your workout', instruction: 'Any exercise. Shows form, not flex. Face optional.', time_estimate: '5 min', verification_method: 'video', day_preference: 5, category: 'effort' },
    { title: 'Photo: Your meal prep for this week', instruction: '3+ containers. Shows discipline > motivation.', time_estimate: '5 min', verification_method: 'photo', category: 'consistency' },
    { title: 'Voice note: Spot me. How would you motivate me?', instruction: '45 seconds. Show me your gym energy.', time_estimate: '5 min', verification_method: 'voice', day_preference: 8, category: 'vibe' }
  ],

  'Cooks': [
    { title: 'Photo: Cook something from scratch today', instruction: 'Show final plate. No Swiggy/Zomato bags in frame.', time_estimate: '15 min', verification_method: 'photo', day_preference: 1, category: 'effort' },
    { title: 'Voice note: Walk me through the last meal you made', instruction: '45 seconds. What was hardest step? Would you make it for me?', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Photo: Your fridge. Show me you cook', instruction: 'Vegetables, proteins. Not just beer and takeout.', time_estimate: '2 min', verification_method: 'photo', category: 'intro' },
    { title: 'Video: Flip an omelette or dosa in 15s', instruction: 'Shows skill. No stock footage.', time_estimate: '5 min', verification_method: 'video', category: 'effort' },
    { title: 'Photo: Handwritten recipe from your family', instruction: 'Mom’s dish, grandma’s dish. Shows roots.', time_estimate: '15 min', verification_method: 'photo', day_preference: 8, category: 'effort' }
  ],

  'Family Guy': [
    { title: 'Photo: You with family. Blur faces if needed', instruction: 'Shows you’re close. Can be old photo.', time_estimate: '5 min', verification_method: 'photo', day_preference: 1, category: 'vibe' },
    { title: 'Voice note: What’s one tradition in your family?', instruction: '45 seconds. Sunday lunch, Diwali, anything.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Screenshot: Last call with mom or dad', instruction: 'Call log. Shows you check in. Blur numbers.', time_estimate: '2 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Voice note: How would you raise kids?', instruction: '60 seconds. 1 value you’d teach. Shows intent.', time_estimate: '5 min', verification_method: 'voice', category: 'vibe' },
    { title: 'Photo: Something your parent gave you', instruction: 'Watch, book, advice. Shows you keep memories.', time_estimate: '2 min', verification_method: 'photo', day_preference: 8, category: 'effort' }
  ],

  'Entrepreneur': [
    { title: 'Photo: Your workspace or laptop. Show you build', instruction: 'Code, design, spreadsheet. Blur sensitive data.', time_estimate: '2 min', verification_method: 'photo', day_preference: 1, category: 'intro' },
    { title: 'Voice note: Pitch yourself like a startup', instruction: '60 seconds. What’s your unfair advantage?', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Screenshot: Something you shipped this month', instruction: 'App, post, sale, deal. Proves execution.', time_estimate: '2 min', verification_method: 'photo', category: 'effort' },
    { title: 'Voice note: Tell me about a time you failed', instruction: '60 seconds. What did you learn? Shows resilience.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Handwrite: What problem do you solve? Photo it', instruction: '3 sentences. Your handwriting. Shows clarity.', time_estimate: '15 min', verification_method: 'photo', day_preference: 8, category: 'effort' }
  ],

  'Financially Stable': [
    { title: 'Photo: Screenshot your SIP or investment app', instruction: 'Blur amounts. Shows you invest, not just spend.', time_estimate: '2 min', verification_method: 'photo', day_preference: 1, category: 'intro' },
    { title: 'Voice note: What’s your money philosophy?', instruction: '45 seconds. Save, invest, spend? Be specific.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Photo: Your credit card. Cover numbers', instruction: 'Shows you have credit. Which bank? Why?', time_estimate: '2 min', verification_method: 'photo', category: 'intro' },
    { title: 'Voice note: What’s one financial goal this year?', instruction: '45 seconds. Must have numbers.', time_estimate: '5 min', verification_method: 'voice', category: 'vibe' },
    { title: 'Photo: Something you bought that was an investment', instruction: 'Course, tool, asset. Not shoes. Shows long-term thinking.', time_estimate: '5 min', verification_method: 'photo', day_preference: 8, category: 'effort' }
  ],

  'Career Focused': [
    { title: 'Photo: Your LinkedIn profile headline', instruction: 'Screenshot. Shows you’re serious about work.', time_estimate: '2 min', verification_method: 'photo', day_preference: 1, category: 'intro' },
    { title: 'Voice note: What’s your 2am work story?', instruction: '60 seconds. Time you grinded. Shows drive.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Photo: Your work bag/essentials laid out', instruction: 'Laptop, notebook, charger. Shows preparation.', time_estimate: '2 min', verification_method: 'photo', category: 'intro' },
    { title: 'Voice note: Where do you see your career in 3 years?', instruction: '45 seconds. Title, company, impact.', time_estimate: '5 min', verification_method: 'voice', category: 'vibe' },
    { title: 'Screenshot: A win at work this quarter', instruction: 'Email praise, promotion, deal. Blur sensitive data.', time_estimate: '5 min', verification_method: 'photo', day_preference: 8, category: 'effort' }
  ],

  'Adventurous': [
    { title: 'Photo: Last place you explored in your city', instruction: 'Act like tourist. Show building/street name.', time_estimate: '15 min', verification_method: 'photo', day_preference: 1, category: 'effort' },
    { title: 'Voice note: What’s the craziest thing you’ve done?', instruction: '60 seconds. Skydiving, solo trip, anything.', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Photo: Your passport with 1 stamp visible', instruction: 'Cover numbers. Shows you travel.', time_estimate: '2 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Video: Do 10 pushups anywhere public', instruction: '15 seconds. Park, office, street. Shows spontaneity.', time_estimate: '5 min', verification_method: 'video', category: 'effort' },
    { title: 'Voice note: Plan a spontaneous day trip for us', instruction: '60 seconds. Leave now. Where we going?', time_estimate: '5 min', verification_method: 'voice', day_preference: 8, category: 'effort' }
  ],

  'Funny': [
    { title: 'Voice note: Tell me a joke. Make me laugh', instruction: '30 seconds. No “your mom” jokes. Be witty.', time_estimate: '2 min', verification_method: 'voice', day_preference: 1, category: 'vibe' },
    { title: 'Send me your best meme. Make it custom', instruction: 'Use my bio. Show you’re funny, not just forwarding.', time_estimate: '5 min', verification_method: 'photo', category: 'effort' },
    { title: 'Video: Do an impression for 15 seconds', instruction: 'Celebrity, friend, anyone. Shows you don’t take yourself seriously.', time_estimate: '5 min', verification_method: 'video', day_preference: 5, category: 'vibe' },
    { title: 'Voice note: Roast me. Keep it playful', instruction: '30 seconds. Based on my bio only. Shows banter.', time_estimate: '2 min', verification_method: 'voice', category: 'vibe' },
    { title: 'Photo: Your most embarrassing pic. Own it', instruction: 'Childhood, bad haircut. Shows confidence.', time_estimate: '5 min', verification_method: 'photo', day_preference: 8, category: 'effort' }
  ],

  'Good Listener': [
    { title: 'Voice note: Repeat back 3 things from my bio', instruction: '30 seconds. Proves you actually listen.', time_estimate: '2 min', verification_method: 'voice', day_preference: 1, category: 'effort' },
    { title: 'Text me a question about my bio. Screenshot it', instruction: 'Not “how are you”. Something specific you want to know.', time_estimate: '2 min', verification_method: 'photo', category: 'effort' },
    { title: 'Voice note: What did I say in my last voice note?', instruction: 'If I sent one. 30 seconds. Shows you pay attention.', time_estimate: '2 min', verification_method: 'voice', category: 'effort' },
    { title: 'Video: Nod and react to me talking for 30s', instruction: 'I’ll send voice note. You listen on video. Shows presence.', time_estimate: '5 min', verification_method: 'video', day_preference: 5, category: 'vibe' },
    { title: 'Voice note: Summarize what I want in 45s', instruction: 'Based on all my tasks. Shows you get me.', time_estimate: '5 min', verification_method: 'voice', day_preference: 8, category: 'effort' }
  ],

  'Curious': [
    { title: 'Voice note: Ask me 3 questions you really want to know', instruction: '45 seconds. No “what’s your type”. Go deep.', time_estimate: '5 min', verification_method: 'voice', day_preference: 1, category: 'vibe' },
    { title: 'Photo: A fact or article you found interesting today', instruction: 'Screenshot or photo of text with a 1-sentence note why.', time_estimate: '5 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Voice note: What’s something you want to learn this year?', instruction: '45 seconds. Why does it interest you?', time_estimate: '5 min', verification_method: 'voice', day_preference: 5, category: 'vibe' },
    { title: 'Photo: Something unique you noticed on your commute', instruction: 'Architecture, sign, event. Shows you notice the world.', time_estimate: '2 min', verification_method: 'photo', category: 'vibe' },
    { title: 'Video: Explain a random interesting fact in 15 seconds', instruction: 'Own it. Proves you look things up.', time_estimate: '2 min', verification_method: 'video', day_preference: 8, category: 'effort' }
  ]
};
