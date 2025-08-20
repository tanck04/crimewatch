from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_number = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(account_sid, auth_token)

# ✅ Your verified Twilio numbers for each division
DIVCODE_PHONE_MAP = {
    "ALPHA": "+6583057010",
    "DELTA": "+6580105420",
    "ECHO": "+6587801774",
    "FOXTROT": "+6583968371",
    "GOLF": "+6581201337",
    "JULIET": "++6588194904",
    "LIMA": "+6581201337",
}

def send_sms_by_divcode(divcode: str, message: str) -> str:
    try:
        to_number = DIVCODE_PHONE_MAP.get(divcode.upper())
        if not to_number:
            return f"❌ Unknown division code: {divcode}"

        sent_message = client.messages.create(
            body=message,
            from_=twilio_number,   # always from your Twilio number
            to=to_number           # different TO number depending on div
        )

        print(f"✅ SMS sent to {to_number}")
        print(f"📬 SID: {sent_message.sid}")
        return f"✅ Message sent. SID: {sent_message.sid}"
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return f"❌ Error sending SMS: {str(e)}"
