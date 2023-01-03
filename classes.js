/**
 * @file This file contains my classes
 * @author Logan Brewer
 * Last edited: May 19, 2022 - Added a Person class
 */

class Gallery {
    constructor(galleryIn, albumsIn = []) {
        this.galleryName = galleryIn
        this.albums = albumsIn
    }
}

class Album {
    constructor(albumIn, artPiecesIn) {
        this.albumName = albumIn
        this.artPieces = artPiecesIn
    }
}

class ArtPiece {
    constructor(artNameIn, artistIn, descriptionIn, imageIn, index) {
        this.artName = artNameIn
        this.artist = artistIn
        this.description = descriptionIn
        this.image = imageIn
        this.indexOfArt = index
    }
}

class Person {
    constructor(idIn, nameIn) {
        this.byuId = idIn
        this.personName = nameIn
    }
}

module.exports = {Gallery, Album, ArtPiece, Person}