const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers
} = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

const router = express.Router();

function removeFile(path) {
    if (fs.existsSync(path)) fs.rmSync(path, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let number = req.query.number;

    async function GIFTED_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);

        try {
            const sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                syncFullHistory: false,
                browser: Browsers.macOS("Safari")
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                number = number.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(number);
                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
                if (connection === "open") {
                    await delay(5000);
                    const credsPath = `./temp/${id}/creds.json`;
                    const credsData = fs.readFileSync(credsPath);

                    const generateSessionID = () => {
                        const prefix = "3EB";
                        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let id = prefix;
                        while (id.length < 22) {
                            id += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        return id;
                    };

                    try {
                        const mega_url = await upload(fs.createReadStream(credsPath), `${sock.user.id}.json`);
                        const sessionString = mega_url.replace("https://mega.nz/file/", "");
                        const sessionMessage = "QUEEN-ADIZA~" + sessionString;

                        const msg = await sock.sendMessage(sock.user.id, { text: sessionMessage });

                        const info = `*Hello there QUEEN ADIZA User! 👋🏻* 

> Do not share your session id with anyone.

*Thanks for using ADIZA 🇬🇭*

> Join WhatsApp Group :- ⤵️

https://chat.whatsapp.com/Iz8jA4DdW9qCQpR0YbMlnz

Dont forget to fork the repo ⬇️

https://github.com/Matri199/Queen-Adiza

> *© Powered BY 𝗠𝗔𝗧𝗥𝗜𝗫-𝗫-𝗞𝗜𝗡𝗚 🔮*`;

                        await sock.sendMessage(sock.user.id, {
                            text: info,
                            contextInfo: {
                                externalAdReply: {
                                    title: "MATRIX-X-KING",
                                    thumbnailUrl: "https://raw.githubusercontent.com/Matri199/Adiza-Session/main/connect_btn.jpg",
                                    sourceUrl: "https://chat.whatsapp.com/Iz8jA4DdW9qCQpR0YbMlnz",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        }, { quoted: msg });
                    } catch (e) {
                        const errMsg = await sock.sendMessage(sock.user.id, { text: String(e) });

                        const fallbackMsg = `*Don't Share with anyone this code use for deploy QUEEN-ADIZA*\n\n ◦ *Github:* https://github.com/Matri199/Queen-Adiza`;

                        await sock.sendMessage(sock.user.id, {
                            text: fallbackMsg,
                            contextInfo: {
                                externalAdReply: {
                                    title: "QUEEN-ADIZA",
                                    thumbnailUrl: "https://raw.githubusercontent.com/Matri199/Adiza-Session/refs/heads/main/connect_btn.jpg",
                                    sourceUrl: "https://chat.whatsapp.com/Iz8jA4DdW9qCQpR0YbMlnz",
                                    mediaType: 2,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        }, { quoted: errMsg });
                    }

                    await delay(10);
                    await sock.ws.close();
                    removeFile(`./temp/${id}`);
                    console.log(`👤 ${sock.user.id} Connected ✅ Restarting process...`);
                    process.exit();
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(10);
                    GIFTED_MD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.log("Service restarted due to error");
            removeFile(`./temp/${id}`);
            if (!res.headersSent) {
                res.send({ code: "❗ Service Unavailable" });
            }
        }
    }

    await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
