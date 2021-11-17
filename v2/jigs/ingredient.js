const Run = require('run-sdk')

class Ingredient extends Run.Jig {

    init(typeId, quantity){
        this.typeId = typeId;
        this.quantity = quantity;
    }
}

module.exports = { Ingredient }
