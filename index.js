/**
 * @file This is the main file for the program
 * @author Logan Brewer
 * Last edited: June 2nd, 2022 - Added userMessage
 */

const io = require('console-read-write');
const {getAwsParameters} = require("./database");
const {testAPIs, metAPI, metArtPiecesAPI, byuAlbumsAPI, personAPI, getToken} = require("./api");
const {menuItems, welcome} = require("./frontend")
const {Gallery} = require("./classes");
userMessage = ''

const byuGalleries = [
    {name: "Museum of Art", code: "2"},
    {name: "BYU Photo", code: "8"},
    {name: "Harold B. Lee Library", code:"15"},
    {name: "Bean Museum", code:"23"}
]

async function main() {
    await getAwsParameters()
    let byuId = await io.ask('What is your byu ID?')
    if (byuId.length !== 9) {
        console.log("Try again. Enter a valid BYU ID.")
        return 0
    }
    let userToken = await getToken()
    await testAPIs(byuId, userToken)
    let user = await personAPI(byuId, userToken)
    console.log("Gathering information... this will take 2-3 minutes.")

    let allGalleries = []
    for (let i = 0; i < byuGalleries.length; i++) {
         allGalleries.push(await byuAlbumsAPI(byuGalleries[i], userToken))
    }
    // const metAlbums = await metArtPiecesAPI(await metAPI())
    // allGalleries.push(new Gallery("Metropolitan Museum of Art" , metAlbums))

    console.clear()
    await welcome(user)
    await menuItems(allGalleries, user)
}

main()