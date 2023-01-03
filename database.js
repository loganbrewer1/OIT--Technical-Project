/**
 * @file This is the database file
 * @author Logan Brewer
 * Last edited: June 2nd, 2022 - Changed user messages
 */

const oracle = require('oracledb')
const Database = require('aws-sdk')
oracle.outFormat = oracle.OBJECT;
oracle.autoCommit = true;

let ssm = new Database.SSM({region: 'us-west-2'});

const oracleConfig = {
    user: process.env.user,
    password: process.env.password,
    connectString: 'cman1-dev.byu.edu:31200/cescpy1.byu.edu'
}

const params = {
    Names: [
        '/Brewer-Technical-Challenge/dev/Password',
        '/Brewer-Technical-Challenge/dev/USERNAME'
    ],
    WithDecryption: true
};

/**
 * Tests if connected to Oracle and VPN is turned on
 * @params none
 * @returns none
 */
async function testOracleConnectivity() {
    try {
        const conn = await oracle.getConnection(oracleConfig)
        await conn.close()
    } catch(error) {
        console.log('Unable to create a connection to on-prem OracleDB')
        if (error.errorNum === 12170) {
            console.error('You are not connected ot the VPN. Connect and try again')
        }
        else {
            console.log('This is the error that occurred:' )
            throw error
        }
    }
}

/**
 * Gets username and password for oracle from AWS
 * @params none
 * @returns none
 */
async function getAwsParameters() {
    try {
        let response = await ssm.getParameters(params).promise()
        oracleConfig.user = response.Parameters[1].Value
        oracleConfig.password = response.Parameters[0].Value
        await testOracleConnectivity()
    }
    catch (e) {
            console.log('Please connect to AWS CLI and try again.')
            process.exit()
    }
}

/**
 * Adds new art piece to art piece table
 * @param {string} artId: Art ID
 * @param {string} art_name: Art piece name
 * @param {string} author: Artist
 * @param {string} photoLink: URL link
 * @returns none
 */
async function addArtToTable (artId, art_name, author, photoLink) {
    try {
        const conn = await oracle.getConnection(oracleConfig)
        await conn.execute('INSERT INTO OIT#LBREWER4.ART ' +
            '                       (ART_ID' +
            '                     , ART_NAME' +
            '                     , ARTIST' +
            '                     , IMAGE_SRC)' +
            '               VALUES (:artid' +
            '                     , :artName' +
            '                     , :author' +
            '                     , :photoLink)',
                                    [artId
                                  , art_name
                                  , author
                                  , photoLink])
        await conn.close()
    } catch(e) {
        if (e.message.includes('unique constraint')) { }
        else {throw e}
    }
}

/**
 * Adds user to the user table
 * @param {object} person: Person API byu_id and name
 * @returns none
 */
async function addUserToTable (person) {
    try {
        const conn = await oracle.getConnection(oracleConfig)
        await conn.execute('INSERT INTO OIT#LBREWER4.ART_USERS ' +
            '                      (BYU_ID' +
            '                      , NAME) ' +
            '               VALUES (:id' +
            '                       , :name)',
                                    [person.byuId
                                    , person.personName])
        await conn.close()
    } catch(e) {
        if (e.message.includes('unique constraint')) {}
        else {throw e}
    }
}

/**
 * Adds to the User_Art table
 * @param {object} person: Person API byu_id and name
 * @param {string} artId: Art ID
 * @returns none
 */
async function addUserArtToTable (person, artId, artName) {
    try {
        const conn = await oracle.getConnection(oracleConfig)
        await conn.execute('INSERT INTO OIT#LBREWER4.USER_ART ' +
            '                      (BYU_ID' +
            '                       , ART_ID' +
            '                       , ART_NAME) ' +
            '               VALUES (:id' +
            '                       , :idForArt' +
            '                       , :nameForArt)',
                                    [person.byuId
                                    , artId
                                    , artName])
        await conn.close()
        userMessage = 'An art piece was added to your gallery\n'
    } catch(e) {
        if (e.message.includes('unique constraint')) {
            userMessage = 'That art piece is already in your gallery\n'
        }
        else {
            console.log('Unable to create new item on on-prem OracleDB')
            throw e
        }
    }
}

/**
 * Gets the art pieces in the user's gallery
 * @param {object} user: Person API byu_id and name
 * @returns none
 */
async function getMyGallery (user) {
    try {
        const conn = await oracle.getConnection(oracleConfig)
        let table = await conn.execute('SELECT ART_ID AS idArt' +
            '                                  , ART_NAME AS "Art Piece" ' +
            '                                  , CASE WHEN ARTIST IS NULL THEN \'Anonymous\' ELSE ARTIST END AS "Artist" ' +
            '                                  , CASE WHEN IMAGE_SRC IS NULL THEN \'No available link\' ELSE IMAGE_SRC END AS "Link"' +
            '                           FROM OIT#LBREWER4.ART ' +
            `                                  WHERE ART_ID IN (
                                                    SELECT ART_ID FROM OIT#LBREWER4.USER_ART
                                                    WHERE BYU_ID = ${user.byuId})
                                               AND ART_NAME IN (
                                                    SELECT ART_NAME FROM OIT#LBREWER4.USER_ART
                                                    WHERE BYU_ID = ${user.byuId})`)
        await conn.close()
        return table
    } catch(e) {
        console.log('Unable to get the table')
        throw e
    }
}

/**
 * Removes the chose art piece from the oracle database
 * @param {object} person: Person API byu_id and name
 * @param {string} artId: Art ID
 * @param {string} artName: Art Name
 * @returns none
 */
async function removeUserArtFromTable (person, artId, artName) {
    try {
        const conn = await oracle.getConnection(oracleConfig)
        await conn.execute('DELETE FROM OIT#LBREWER4.USER_ART  ' +
            `                           WHERE (ART_ID = \'${artId}\' 
                                        AND ART_NAME = \'${artName}\')
                                        AND BYU_ID = ${person.byuId}`)
        await conn.close()
        userMessage = 'Removed art piece from database \n'
    } catch(e) {
        console.log('Unable to delete item from on-prem OracleDB')
        throw e
    }
}

/**
 * Removes all art pieces from the oracle database
 * @param {object} person: Person API byu_id and name
 * @returns none
 */
async function removeAllFromTable (person) {
    try {
        const conn = await oracle.getConnection(oracleConfig)
        await conn.execute('DELETE FROM OIT#LBREWER4.USER_ART  ' +
            `                           WHERE BYU_ID = ${person.byuId}`)
        await conn.close()
        userMessage = 'Removed all art pieces from database \n'
    } catch(e) {
        console.log('Unable to delete items from on-prem OracleDB')
        throw e
    }
}

module.exports = {getAwsParameters, addArtToTable, addUserArtToTable, addUserToTable, getMyGallery, removeUserArtFromTable, removeAllFromTable}



// CREATE TABLE ART
// (
//     ART_ID VARCHAR2(100) NOT NULL,
//     ART_NAME VARCHAR2(100),
//     ARTIST VARCHAR2(100),
//     IMAGE_SRC VARCHAR2(100)
// )
//
// CREATE TABLE USER_ART
// (
//     BYU_ID VARCHAR2(9) NOT NULL,
//     ART_ID VARCHAR2(100),
//     CONSTRAINT PK_D PRIMARY KEY (BYU_ID, ART_ID)
// )
//
// CREATE TABLE ART_USERS
// (
//     BYU_ID VARCHAR2(9) NOT NULL,
//     NAME VARCHAR2(100)
// )