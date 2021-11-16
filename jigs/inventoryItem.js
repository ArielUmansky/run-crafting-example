const Run = require('run-sdk')

// Does it make sense for this to be a Jig?
class InventoryItem extends Run.Jig {

    init(item, quantity, owner) {
        this.owner = owner
        this.item = item
        this.quantity = quantity
    }

    getItemTypeId(){
        return this.item.typeId;
    }

    decreaseQuantity(quantity){
        if(quantity > this.quantity) throw new Error(InventoryItem.NOT_ENOUGH_QUANTITY_ERROR_MESSAGE);
        this.quantity = this.quantity - quantity;
    }

    send(owner){
        this.owner = owner;
    }
}

module.exports = { InventoryItem }
