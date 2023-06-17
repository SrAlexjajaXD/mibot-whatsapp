const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')
const axios = require('axios')
const { saveMessagesUser, saveMessagesBot, getConversation } = require('./bdHelper')
require('dotenv').config();

const MONGO_DB_URI = process.env.MONGO_DB_URI
const MONGO_DB_NAME = process.env.MONGO_DB_NAME
const apiKey = process.env.OPENAI_API_KEY;

const botResponse = async (peticion) => {
    // const cleanPeticion = peticion.replace(/^+/, '');
    const config = {
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        data: {
            model: "gpt-3.5-turbo",
            messages: peticion
        },
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };
    let text = '';
    await axios(config).then((respuesta) => {
        text = respuesta.data.choices[0].message.content
    })
    const cleanText = text.replace(/^\n+/, '');
    console.log(text)
    return cleanText
}

const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic }) => {
        await saveMessagesUser(ctx)
        const jsonss=await getConversation(ctx)
        const data = await botResponse(jsonss)
        flowDynamic(data)
        await saveMessagesBot(ctx, data)
    })



const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    })
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
