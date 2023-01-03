/**
 * @file This is the UI file
 * @author Logan Brewer
 * Last edited: June 3rd, 2022 - Indicated if an art piece has no image
 */

const {addUserToTable, addArtToTable, addUserArtToTable, getMyGallery, removeUserArtFromTable, removeAllFromTable} = require("./database");
const inquirer = require('inquirer');
const open = require("open");

/**
 * Welcome function
 * @param {object} user: Stores the user's information
 * @returns none
 */
function welcome(user) {
    userMessage = `Hi ${user.personName}! Welcome to your museum tour!\n`
}

/**
 * Prints Ascii Title
 * @params none
 * @returns none
 */
async function printAsciiTitle() {
    console.log('.___  ___.  __    __       _______. _______  __    __  .___  ___.    .___________.  ______    __    __  .______      \n' +
        '|   \\/   | |  |  |  |     /       ||   ____||  |  |  | |   \\/   |    |           | /  __  \\  |  |  |  | |   _  \\     \n' +
        '|  \\  /  | |  |  |  |    |   (----`|  |__   |  |  |  | |  \\  /  |    `---|  |----`|  |  |  | |  |  |  | |  |_)  |    \n' +
        '|  |\\/|  | |  |  |  |     \\   \\    |   __|  |  |  |  | |  |\\/|  |        |  |     |  |  |  | |  |  |  | |      /     \n' +
        '|  |  |  | |  `--\'  | .----)   |   |  |____ |  `--\'  | |  |  |  |        |  |     |  `--\'  | |  `--\'  | |  |\\  \\----.\n' +
        '|__|  |__|  \\______/  |_______/    |_______| \\______/  |__|  |__|        |__|      \\______/   \\______/  | _| `._____|\n' +
        '                                                                                                                     ')

    console.log(userMessage)
    userMessage = ''
}

/**
 * Main Menu
 * @param {array} allMuseums: Array of museum objects.
 * @param {object} user: Person API byu_id and name
 * @returns The appropriate functions based on the menu choice
 */
async function menuItems(allMuseums, user) {
    await printAsciiTitle()
    const getMenuChoice = await inquirer.prompt([
        {
            name: 'menuChoice',
            type: 'list',
            message: 'Menu: Please type letter or name',
            choices: [
                'A - Add\t\tFind an art piece and add it to your favorites',
                'V - View\t\tSee your gallery of favorites',
                'R - Remove\t\tRemove an art piece from your favorites',
                'Q - Quit\t\tTerminate Program',]
        },
    ])
    if (getMenuChoice.menuChoice === 'A - Add\t\tFind an art piece and add it to your favorites') {
        console.clear()
        return await chooseMuseum(allMuseums, user)
    }
    else if (getMenuChoice.menuChoice === 'V - View\t\tSee your gallery of favorites') {
        let artLink = await viewChoice(await getMyGallery(user), allMuseums, user)
        if (artLink === 'Back') {
            console.clear()
            return menuItems(allMuseums, user)
        }
        else if (artLink === 0) {
            return 0
        }
        else if (Array.isArray(artLink) === true) {
            for (let i = 0; i < artLink.length; i++) {
                await open(artLink[i])
            }
            console.clear()
            return menuItems(allMuseums, user)
        }
        else {
            await open(artLink)
            console.clear()
            return menuItems(allMuseums, user)
        }
    }
    else if (getMenuChoice.menuChoice === 'R - Remove\t\tRemove an art piece from your favorites') {
        let exitToken = false
        do {
            let artId = await deleteChoice(await getMyGallery(user), allMuseums, user)
            if (artId === 'All')  {
                if (await choiceConfirmation('Are you sure?') === true) {
                    console.clear()
                    await removeAllFromTable(user)
                }
                else {
                    console.clear()
                }
            }
            else if (artId === 0 || artId === undefined) {
                exitToken = true
                return 0
            }
            else {
                if (await choiceConfirmation('Are you sure?') === true) {
                    console.clear()
                    await removeUserArtFromTable(user, artId.id, artId.name)
                }
                else {
                    console.clear()
                }
            }
        } while (exitToken === false)
    }
    else {
        console.clear()
        console.log(`Please come again, ${user.personName}!`)
        return 0
    }
}

/**
 * User selects the museum of their choice
 * @param {array} allMuseums: Array of museum objects.
 * @param {object} user: Person API byu_id and name
 * @returns The chooseAlbum function
 */
async function chooseMuseum(allMuseums, user) {
    let onlyNames = []
    let museumIndex = 0

    console.clear()
    await printAsciiTitle()
    onlyNames.push('Back')

    for (let i = 0; i < allMuseums.length; i++) {
        onlyNames.push(allMuseums[i].galleryName)
    }

    const getMenuChoice = await inquirer.prompt([
        {
            name: 'menuChoice',
            type: 'list',
            message: 'Menu: Choose the Museum you would like to see',
            choices: onlyNames,
            pageLength: 40,
        },
    ])

    for (let i = 0; i < allMuseums.length; i++) {
        if (allMuseums[i].galleryName === getMenuChoice.menuChoice) {
            museumIndex = i
        }
    }
    if (getMenuChoice.menuChoice === 'Back') {
        console.clear()
        await menuItems(allMuseums, user)
    }
    else {
        console.clear()
        return await chooseAlbum(allMuseums, museumIndex, user)
    }
}

/**
 * User selects the gallery of their choice
 * @param {array} allMuseums: Array of museum objects.
 * @param {number} museumIndex: The user's museum choice
 * @param {object} user: Person API byu_id and name
 * @returns The chooseArtPiece function
 */
async function chooseAlbum(allMuseums, museumIndex, user) {
    let onlyNames = []
    let albumIndex = 0

    console.clear()
    await printAsciiTitle()
    onlyNames.push('Back')

    for (let i = 0; i < allMuseums[museumIndex].albums.length; i++) {
        onlyNames.push(allMuseums[museumIndex].albums[i].albumName)
    }

    const getMenuChoice = await inquirer.prompt([
        {
            name: 'menuChoice',
            type: 'list',
            message: 'Menu: Choose the gallery you would like to see',
            choices: onlyNames,
            pageLength: 40,
            pageSize: 40,
        },
    ])

    for (let i = 0; i < allMuseums[museumIndex].albums.length; i++) {
        if (allMuseums[museumIndex].albums[i].albumName === getMenuChoice.menuChoice) {
            albumIndex = i
        }
    }
    if (getMenuChoice.menuChoice === 'Back') {
        console.clear()
        await chooseMuseum(allMuseums, user)
    }
    else {
        console.clear()
        return chooseArtPiece(allMuseums, museumIndex, albumIndex, user)
    }
}

/**
 * User selects an art piece of their choice
 * @param {array} allMuseums: Array of museum objects.
 * @param {number} museumIndex: The user's museum choice
 * @param {number} albumIndex: The user's gallery of choice
 * @param {object} user: Person API byu_id and name
 * @returns none
 */
async function chooseArtPiece(allMuseums, museumIndex, albumIndex, user) {
    let onlyNames = []
    let artistArray = []
    let imageArray = []
    let artPieceIndex = 0

    console.clear()
    await printAsciiTitle()
    onlyNames.push('Back')

    for (let i = 0; i < allMuseums[museumIndex].albums[albumIndex].artPieces.length; i++) {
        if (allMuseums[museumIndex].albums[albumIndex].artPieces[i].image === "") {
            imageArray.push("(No image)")
        }
        else {
            imageArray.push(' ')
        }

        if (allMuseums[museumIndex].albums[albumIndex].artPieces[i].artist === "") {
            artistArray.push("Anonymous")
        }
        else {
            artistArray.push(allMuseums[museumIndex].albums[albumIndex].artPieces[i].artist)
        }

        onlyNames.push(allMuseums[museumIndex].albums[albumIndex].artPieces[i].artName + ' - ' + artistArray[i] + ' ' + imageArray[i])
    }

    const getMenuChoice = await inquirer.prompt([
        {
            name: 'menuChoice',
            type: 'list',
            message: 'Menu: Choose an art piece to view',
            choices: onlyNames,
            pageSize: 40,
        },
    ])

    for (let i = 0; i < allMuseums[museumIndex].albums[albumIndex].artPieces.length; i++) {
        if (allMuseums[museumIndex].albums[albumIndex].artPieces[i].artName + ' - ' + artistArray[i] + ' ' + imageArray[i] === getMenuChoice.menuChoice) {
            artPieceIndex = i
        }
    }

    let artChoice = allMuseums[museumIndex].albums[albumIndex].artPieces[artPieceIndex]

    if (getMenuChoice.menuChoice === 'Back') {
        console.clear()
        await chooseAlbum(allMuseums, museumIndex, user)
    }
    else {
        if (artChoice.image === "") {
            console.log("This art piece has no image link.")
        }
        await open(artChoice.image)
        if (await choiceConfirmation('Would you like to add this art piece to your gallery?') === true) {
            await addUserToTable(user)
            await addArtToTable(artChoice.indexOfArt, artChoice.artName, artChoice.artist, artChoice.image)
            console.clear()
            await addUserArtToTable(user, artChoice.indexOfArt, artChoice.artName)
            await chooseArtPiece(allMuseums, museumIndex, albumIndex, user)
        }
        else {
            console.clear()
            await chooseArtPiece(allMuseums, museumIndex, albumIndex, user)
        }
    }
}

/**
 * User confirms their choice
 * @param {string} message: The message to show the user before they confirm their decision
 * @returns {boolean} getMenuChoice.menuChoice: The user's choice
 */
async function choiceConfirmation(message) {
    const getMenuChoice = await inquirer.prompt([
        {
            name: 'menuChoice',
            type: 'confirm',
            message: message,
            choices: [
                'Yes',
                'No']
        },
    ])
    return getMenuChoice.menuChoice
}

/**
 * User selects the art piece in their gallery to delete
 * @param {array} allMuseums: Array of museum objects.
 * @param {object} myTable: The art table from the oracle database
 * @param {object} user: Person API byu_id and name
 * @returns {string} artIdToDelete: The art ID of the art Piece the user choose to delete
 */
async function deleteChoice(myTable, allMuseums, user) {
    let onlyNames = []
    let idArray = []
    let artPieceIndex = 0
    let artIdToDelete

    if (userMessage === 'Removed art piece from database \n' || userMessage === 'Removed all art pieces from database \n') {
        console.clear()
        return await menuItems(allMuseums, user)
    }
    else if (myTable.rows.length === 0) {
        console.clear()
        userMessage = 'You have no art pieces to remove from your list of favorites \n'
        return await menuItems(allMuseums, user)
    }

    console.clear()
    await printAsciiTitle()
    onlyNames.push('Back')

    console.table(myTable.rows, [
        'Art Piece',
        'Artist',
        'Link'
    ])

    for (let i = 0; i < myTable.rows.length; i++) {
        onlyNames.push(myTable.rows[i]['Art Piece'])
        idArray.push(myTable.rows[i].IDART)
    }
    onlyNames.push('Delete All')

    const getMenuChoice = await inquirer.prompt([
        {
            name: 'menuChoice',
            type: 'list',
            message: 'Menu: Choose an art piece to remove',
            choices: onlyNames,
            pageLength: 40,
            pageSize: 40,
        },
    ])

    for (let i = 0; i < myTable.rows.length; i++) {
        if (myTable.rows[i]['Art Piece'] === getMenuChoice.menuChoice) {
            artPieceIndex = i
        }
    }

    artIdToDelete = {
        id: myTable.rows[artPieceIndex].IDART,
        name: myTable.rows[artPieceIndex]['Art Piece']
    }

    if (getMenuChoice.menuChoice === 'Back') {
        console.clear()
        return await menuItems(allMuseums, user)
    }
    else if (getMenuChoice.menuChoice === 'Delete All') {
        return 'All'
    }
    else {
        return artIdToDelete
    }
}

/**
 * User selects the art piece in their gallery to delete
 * @param {array} allMuseums: Array of museum objects.
 * @param {object} myTable: The art table from the oracle database
 * @param {object} user: Person API byu_id and name
 * @returns {string} artLinkToView: The link to the image of choice
 */
async function viewChoice(myTable, allMuseums, user) {
    let onlyNames = []
    let linkArray = []
    let artPieceIndex = 0
    let artLinkToView = ''

    console.clear()
    await printAsciiTitle()
    onlyNames.push('Back')

    if (myTable.rows.length === 0) {
        console.clear()
        userMessage = 'You have no art pieces to view. Add to your list of favorites.\n'
        await menuItems(allMuseums, user)
    }
    else {
        console.clear()
        await printAsciiTitle()
        console.table(myTable.rows, [
            'Art Piece',
            'Artist',
            'Link'
        ])


        for (let i = 0; i < myTable.rows.length; i++) {
            onlyNames.push(myTable.rows[i]['Art Piece'])
            linkArray.push(myTable.rows[i].Link)
        }
        onlyNames.push('View All')

        const getMenuChoice = await inquirer.prompt([
            {
                name: 'menuChoice',
                type: 'list',
                message: 'Menu: Choose an art piece to view it again',
                choices: onlyNames,
                pageLength: 40,
                pageSize: 40,
            },
        ])

        for (let i = 0; i < myTable.rows.length; i++) {
            if (myTable.rows[i]['Art Piece'] === getMenuChoice.menuChoice) {
                artPieceIndex = i
            }
        }

        artLinkToView = myTable.rows[artPieceIndex].Link

        if (getMenuChoice.menuChoice === 'Back') {
            return 'Back'
        } else if (getMenuChoice.menuChoice === 'View All') {
            return linkArray
        } else {
            return artLinkToView
        }
    }
    return 0
}

module.exports = {welcome, menuItems}

// function