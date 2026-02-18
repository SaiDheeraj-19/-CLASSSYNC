const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('Initializing WhatsApp Client to list groups...');

// Reuse the same auth strategy so we don't need to scan again if already logged in
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED (Scan if needed):');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('\n✅ Client is ready! Fetching chats...\n');

    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.isGroup);

    console.log('------------------------------------------------');
    console.log(`FOUND ${groups.length} GROUPS:`);
    console.log('------------------------------------------------');

    groups.forEach(group => {
        console.log(`NAME: ${group.name}`);
        console.log(`ID:   ${group.id._serialized}`);
        console.log('------------------------------------------------');
    });

    console.log('\nDone. You can copy the ID above.');
    process.exit(0);
});

client.initialize();
