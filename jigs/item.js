const Run = require('run-sdk')

class Item extends Run.Jig {

    init(typeId){
        this.typeId = typeId;
    }

}

module.exports = { Item }
