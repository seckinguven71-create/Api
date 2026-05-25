// api/twilio-trigger.js
const twilio = require('twilio');

// Twilio Konsolundan alacağın gizli anahtarlar (Güvenli Alan)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
// CORS İZİNLERİ
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS isteğine cevap ver
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { toNumber, actionMode, message } = req.body;

    try {

        // 1. ÖNCE SMS GÖNDERİLİR
        await client.messages.create({
            body: message,
            messagingServiceSid: twilioNumber,
            to: toNumber
        });

        // 2. ARDINDAN TELEFON ARANIR
        let twimlUrl = 'http://demo.twilio.com/docs/voice.xml';

        if (actionMode === 'kaza') {

            twimlUrl = `https://twimlets.com/message?Message%5B0%5D=Gvnmoto%20Acil%20Durum%20Uyarisi!%20Ciddi%20bir%20kaza%20algilandi.%20Surucu%20bilgileri%20ve%20konum%20telefonunuza%20mesaj%20olarak%20gonderilmistir.`;

        } else if (actionMode === 'hirsizlik') {

            twimlUrl = `https://twimlets.com/message?Message%5B0%5D=Gvnmoto%20Guvenlik%20Alarmi!%20Motosikletiniz%20kontak%20kapali%20olarak%20hareket%20ettiriliyor.%20Canli%20takip%20linki%20mesaj%20olarak%20iletilmistir.`;

        }

        await client.calls.create({
            url: twimlUrl,
            from: twilioNumber,
            to: toNumber
        });

        return res.status(200).json({ success: true });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }
}
