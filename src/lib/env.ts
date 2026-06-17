export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRole:
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "",
  twilioAccountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || "",
  twilioPhoneNumber: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || "",
};
