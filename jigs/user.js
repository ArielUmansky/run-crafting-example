const Run = require('run-sdk')

class User extends Run.Jig {

    init() {
        this.inventory = [];
    }

    addItem(inventoryItem) {
        if(inventoryItem.owner !== this.owner) {
            throw new Error('There was an error')
        }
        this.inventory.push(inventoryItem);
    }

    removeItemsFromRecipe(recipe){
        recipe.ingredients.forEach(inventoryItem => {
            let userInventoryItem = this.getInventoryItemByType(inventoryItem.getItemTypeId());
            userInventoryItem.decreaseQuantity(inventoryItem.quantity);
        })
    }

    owns(itemType, quantity = 1){
        const inventoryItem = this.getInventoryItemByType(itemType);
        return inventoryItem ? inventoryItem.quantity >= quantity : false;
    }

    getInventory() {
        return this.inventory;
    }

    getInventoryItemByType(itemType) {
        return this.inventory.find(inventoryItem => inventoryItem.item.typeId === itemType);
    }

}

module.exports = { User }
