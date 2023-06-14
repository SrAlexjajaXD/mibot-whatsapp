const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')
const axios = require('axios')
require('dotenv').config();

const MONGO_DB_URI = process.env.MONGO_DB_URI
const MONGO_DB_NAME = process.env.MONGO_DB_NAME
const apiKey = process.env.OPENAI_API_KEY;

const botResponse = async (peticion) => {
    const config = {
        method: 'post',
        url: 'https://api.openai.com/v1/completions',
        data: {
            model: "text-davinci-003",
            prompt: peticion,
            max_tokens: 100,
            temperature: 0.4,
            top_p: 1,
            presence_penalty: 0.0,
            frequency_penalty: 0.0
        },
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };
    let text = '';
    await axios(config).then( (respuesta) =>{
        text = respuesta.data.choices[0].text
    })
    const cleanText = text.replace(/^\n+/, '');
    console.log(text)
    return cleanText
}

const flowPrincipal =  addKeyword(['hola', 'oye', 'ey', 'amigo', 'disculpa', 'necesito'])
    .addAnswer('Pideme lo que necesites :3', {capture:true}, async (ctx, {flowDynamic})=>{
        const data = await botResponse(ctx.body)
        flowDynamic(data)
    })

const flowSecundario = addKeyword(['gracias', 'va', 'sobres']).addAnswer('Estoy para servirte 24/7')


const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    })
    const adapterFlow = createFlow([flowPrincipal, flowSecundario])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
