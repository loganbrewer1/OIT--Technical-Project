/**
 * @file Contains my API calls
 * @author Logan Brewer
 * Last edited: June 3rd, 2022 - Fixed bug
 */

const axios = require('axios')
const inquirer = require('inquirer');
const ProgressBar = require('progress');
const {Gallery, Album , ArtPiece, Person} = require('./classes')


const personOptions = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer token'
    }
}

const byuAlbumOptions = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer token'
    }
}

const byuArtPiecesOptions = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer token'
    }
}

const metGalleryOptions = {
    url: 'https://collectionapi.metmuseum.org/public/collection/v1/departments',
    method: 'GET'
}

/**
 * Tests that the APIs are working
 * @param {number} byuId: User's BYU ID
 * @param {string} token: WSO2 token
 * @returns none
 */
async function testAPIs(byuId, token) {
    let apiList = []
    console.log("Testing APIs...")
    try {
        personOptions.url = `https://api.byu.edu:443/byuapi/persons/v3/${byuId}`
        personOptions.headers = {
            'Authorization': `Bearer ${token}`
        }
        let j = await axios(personOptions)
    }
    catch (e) {
        apiList.push('Persons - v3\n')
    }

    try {
        byuAlbumOptions.url = `https://api.byu.edu/domains/galleries/v1/gallery/2/album`
        byuAlbumOptions.headers = {
            'Authorization': `Bearer ${token}`
        }
        let h = await axios(byuAlbumOptions)
    }
    catch (e) {
        apiList.push('Gallery - v1\n')
    }

    if (apiList.length === 1) {
        console.log('Please subscribe to... \n' + apiList[0])
        process.exit()
    }
    else if (apiList.length === 2) {
        console.log('Please subscribe to... \n' + apiList[0] + apiList[1])
        process.exit()
    }
    else {
        console.log("Testing successful")
        return
    }
}

/**
 * Gets the user's name
 * @params none
 * @returns {string} userToken: Stores the user's WSO2 token.
 */
async function getToken() {
    const token = await inquirer
        .prompt([{
            name: 'WSO2',
            type: 'input',
            message: 'Input your WSO2 Token',
        }])

    let userToken = String(token.WSO2)

    if (userToken.length < 25 || userToken.length > 35) {
        console.log('Invalid WSO2 Token')
        return await getToken()
    }
    return userToken
}

/**
 * Gets the user's name
 * @param {number} byu_id: User's BYU ID
 * @param {string} token: WSO2 token
 * @returns {object} Person: Stores BYU ID and name
 */
async function personAPI(byu_id, token) {
    let name = ''
    personOptions.url = `https://api.byu.edu:443/byuapi/persons/v3/${byu_id}`
    personOptions.headers = {
        'Authorization': `Bearer ${token}`
    }

    try {
        const person = await axios(personOptions)
        name = person.data.basic.first_name.value

        return new Person(byu_id, name)
    }
    catch (e) {
        console.log('The Person API failed. Please try again.')
        process.exit()
    }
}

/**
 * Gets the galleries in the given museum
 * @param {object} galleryIn: User's museum of choice
 * @param {string} token: User's WSO2 Token
 * @returns {object} Gallery: Stores the museum name and galleries in museum.
 */
async function byuAlbumsAPI(galleryIn, token) {
    let albumsArray = []
    let artPiecesArray = []
    byuAlbumOptions.url = `https://api.byu.edu/domains/galleries/v1/gallery/${galleryIn.code}/album`
    byuAlbumOptions.headers = {
        'Authorization': `Bearer ${token}`
    }
    try {
        const byuGallery = await axios(byuAlbumOptions)
        const albums = byuGallery.data.albums
        for (let i=0; i < albums.length; i++) {
            artPiecesArray = await byuArtPiecesAPI(galleryIn.code, String(albums[i].id), token)
            albumsArray.push(new Album(albums[i].name, artPiecesArray))
        }
        return new Gallery(galleryIn.name, albumsArray)
    }
    catch (e) {
        console.log('The Gallery API failed. Please try again.')
        process.exit()
    }
}

/**
 * Gets the art pieces in the given gallery
 * @param {number} galleryId: User's museum of choice
 * @param {number} albumId: User's gallery of choice
 * @returns {object} Gallery: Stores the gallery name and art pieces in gallery.
 */
async function byuArtPiecesAPI(galleryId, albumId, token) {
    let artPiecesArray = []
    let artPieceNames = []
    byuArtPiecesOptions.url = `https://api.byu.edu/domains/galleries/v1/gallery/${galleryId}/album/${albumId}`
    byuArtPiecesOptions.headers = {
        'Authorization': `Bearer ${token}`
    }

    const byuArtPieces = await axios(byuArtPiecesOptions)
    for (let i=0; i < byuArtPieces.data.artwork.length; i++) {
        if (artPieceNames.includes(byuArtPieces.data.artwork[i].name) === false) {
            let artPieceName = byuArtPieces.data.artwork[i].name.split('').filter(character => character !== '\'').join('')
            artPiecesArray.push(new ArtPiece(artPieceName, byuArtPieces.data.artwork[i].author, byuArtPieces.data.artwork[i].description, byuArtPieces.data.artwork[i].image.src, i))
        }
        artPieceNames.push(byuArtPieces.data.artwork[i].name)
    }

    return artPiecesArray
}

/**
 * Gets the galleries in metropolitan museum
 * @params none
 * @returns {array} metAlbumsArray: Stores the galleries in the metropolitan museum
 */
async function metAPI() {
    try {
        let metAlbumsArray = []
        const metGallery = await axios(metGalleryOptions)

        for (let i = 0; i < metGallery.data.departments.length; i++) {
            metAlbumsArray.push(metGallery.data.departments[i])
        }

        return metAlbumsArray
    }
    catch (e) {
        console.log('The Metropolitan Museum of Art API failed. Please restart the program and try again.')
        process.exit()
    }
}

/**
 * Gets the art piece IDs in the given gallery
 * @param {array} galleriesArray: An array of the galleries in the metropolitan museum
 * @returns {array} allMetPiecesArray: Stores an array of the art piece IDs from the given gallery
 */
async function metArtPiecesAPI(galleriesArray) {
    let allMetArtPiecesArray = []
    let bar = new ProgressBar('[:bar] :percent',{total:271, width: 50, incomplete:' '})

    try {
        for (let i = 0; i < galleriesArray.length; i++) {
            metGalleryOptions.url = `https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=${galleriesArray[i].departmentId}&isHighlight=true&q=beautiful`
            const metGallery = await axios(metGalleryOptions)
            if (metGallery.data.objectIDs) {
                let metArtPiecesArray = []
                for (let i = 0; i < metGallery.data.objectIDs.length; i++) {
                    metArtPiecesArray.push(metGallery.data.objectIDs[i])
                }
                allMetArtPiecesArray.push(new Album(galleriesArray[i].displayName, await metArtPieceObjectsAPI(metArtPiecesArray, bar)))
            }
        }
        return allMetArtPiecesArray
    }
    catch (e) {
        console.log('The Metropolitan Museum of Art API failed. Please restart the program and try again.')
        process.exit()
    }
}

/**
 * Gets the art piece object from the given art piece IDs
 * @param {array} metArtPiecesArray: An array of art piece IDs
 * @returns {array} allMetPiecesArray: An array of art piece objects
 */
async function metArtPieceObjectsAPI(metArtPiecesArray, bar) {
    let artPieceObjectsArray = []
    try {
        for (let i = 0; i < metArtPiecesArray.length; i++) {
            metGalleryOptions.url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${metArtPiecesArray[i]}`
            const metArtPiece = await axios(metGalleryOptions)
            artPieceObjectsArray.push(new ArtPiece(metArtPiece.data.title.split('').filter(character => character !== '\'').join(''), metArtPiece.data.artistDisplayName, metArtPiece.data.artistDisplayBio, metArtPiece.data.primaryImage, i))
            bar.tick()
        }
        return artPieceObjectsArray
    }
    catch (e) {
        console.log('The Metropolitan Museum of Art API failed. Please restart the program and try again.')
        process.exit()
    }
}

module.exports = {personAPI, metAPI, metArtPiecesAPI, byuAlbumsAPI, getToken, testAPIs}