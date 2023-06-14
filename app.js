const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')
const axios = require('axios')
require('dotenv').config();

/**
 * Declaramos las conexiones de Mongo
 */

const MONGO_DB_URI = 'mongodb://mongo:phAg2zQyj0jsZpGzc602@containers-us-west-164.railway.app:6241'
const MONGO_DB_NAME = 'bot'

const apiKey = process.env.OPENAI_API_KEY;
/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */
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



// const flowPrincipal = addKeyword(['bot'])
//     .addAnswer('Que puedo hacer por ti', {capture:true})
//     .addAnswer('Permiteme un momento', null, async (ctx, {flowDynamic, endFlow})=>{
//         const respuesta = await botResponse(ctx.body)
//         flowDynamic(respuesta)
//     })
//     .addAnswer('Listo :3', {delay:1500})




const flowPrincipal =  addKeyword(['hola', 'oye', 'ey', 'amigo', 'disculpa', 'necesito'])
    .addAnswer('Holaaaaaa :3, mi nombre es Maria, un bot creado por Alex')
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
