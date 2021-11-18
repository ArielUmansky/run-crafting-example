const Run = require('run-sdk')
const {Ingredient} = require("./ingredient");
const {Item} = require("./item");


class User extends Run.Jig {
    static ITEM_DOES_NOT_BELONG_TO_THE_USER = 'There was an error';

    init() {
        this.inventory = [];
    }

    addItem(inventoryItem) {
        this._validateInventoryItemOwnership(inventoryItem);
        this.inventory.push(inventoryItem);
    }

    hasEnough(ingredient){
        const quantity = ingredient.quantity || 1;
        const userIngredient = this.getInventoryItemByType(ingredient.typeId);
        return userIngredient ? userIngredient.quantity >= quantity : false;
    }

    burnIngredients(ingredients){
        ingredients.forEach(ingredient => {
            const userIngredient = this.getInventoryItemByType(ingredient.typeId);
            userIngredient && userIngredient.burn(ingredient.quantity);
        })
    }

    has(itemType){
        return this.hasEnough(new Ingredient(itemType, 1));
    }

    send(to){
        this.owner = to;
    }

    getInventory() {
        return this.inventory;
    }

    getInventoryItemByType(itemType) {
        return this.inventory.find(inventoryItem => inventoryItem.item.typeId === itemType);
    }

    _validateInventoryItemOwnership(inventoryItem) {
        if ((inventoryItem.owner !== this.owner) || (inventoryItem.item.owner !== this.owner)) {
            throw new Error(User.ITEM_DOES_NOT_BELONG_TO_THE_USER)
        }
    }

}

module.exports = { User }
User.deps = { Ingredient }
