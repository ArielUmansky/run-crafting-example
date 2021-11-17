const Run = require('run-sdk')

class InventoryItem extends Run.Jig {

    init(item, quantity){
        this.item = item;
        this.quantity = quantity;
    }

    send(owner){
        this.owner = owner;
    }

    burn(quantity){
        this.quantity = this.quantity - quantity;
    }

}

module.exports = { InventoryItem }
