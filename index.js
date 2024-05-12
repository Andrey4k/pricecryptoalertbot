const express = require('express')
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv')
const axios = require('axios'); 

dotenv.config();
//install module cross-env for use .env  + module dotenv
const PORT = process.env.PORT
const TOKEN = process.env.TOKEN
const CRYPTO_API_KEY = process.env.CRYPTO_API_KEY;
const CHAT_ID = process.env.CHAT_ID;
const GET_URL = process.env.GET_URL;


const app = express();
app.use(express.json());
app.listen(PORT, function(err) {
    if (err) console.log(err);
    console.log(`Server listening in ${PORT}`)
});

const bot = new TelegramBot(TOKEN, { polling: true });

// Функция для отправки сообщения в Telegram
function sendTelegramMessage(message) {
    bot.sendMessage(CHAT_ID, message);
}

let previousPrice = 0;
// Функция для выполнения запроса к CryptoCompare API и возврата цены
async function fetchCoinPrice() {
    try {
        const response = await axios.get(`${GET_URL}&api_key=${CRYPTO_API_KEY}`);
        const price = response.data.USD;
        return price;
    } catch (error) {
        console.error('Ошибка при получении цены криптовалюты:', error);
        throw error;
    }
}

bot.on('text', async msg => {
    try {
        if (msg.text === '/start') {
            await bot.sendMessage(msg.chat.id, `Бот начинает свою работу, ожидаю команд.`);
            await bot.sendMessage(msg.chat.id, "Доступные команды:\n" +
            "/start - Начать взаимодействие с ботом\n" +
            "/get - Получить текущую цену Bitcoin\n" +
            "/help - Получить список доступных команд");
            
        } else if (msg.text === '/get') {
            const price = await fetchCoinPrice();
            await bot.sendMessage(msg.chat.id, `Текущая цена Bitcoin: $${price}`);
        } 
    } catch (error) {
        console.log(error);
    }
});
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const message = "Доступные команды:\n" +
                    "/start - Начать взаимодействие с ботом\n" +
                    "/get - Получить текущую цену Bitcoin\n" +
                    "/help - Получить список доступных команд";
    bot.sendMessage(chatId, message);
});



// Вызываем функцию fetchCoinPrice с интервалом в 30 минут
setInterval(async () => {
    try {
        const price = await fetchCoinPrice();
        if (Math.abs(price - previousPrice) >= 500) {
            await sendTelegramMessage(`Текущая цена Bitcoin: $${price}`);
        }
        previousPrice = price;
    } catch (error) {
        console.error('Ошибка при отправке цены криптовалюты:', error);
    }
}, 30 * 60 * 1000);