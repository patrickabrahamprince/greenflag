export async function sendSMS(to: string, body: string) {
  const accountSid = process.env["NEXT_PUBLIC_TWILIO_ACCOUNT_SID"];
  const authToken = process.env["NEXT_PUBLIC_TWILIO_AUTH_TOKEN"];
  const from = process.env["NEXT_PUBLIC_TWILIO_PHONE_NUMBER"];

  if (!accountSid || !authToken || !from) {
    throw new Error("Missing Twilio credentials");
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    }
  );

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Twilio error");
  }
  return json;
}
