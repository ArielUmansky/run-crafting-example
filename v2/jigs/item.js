const Run = require('run-sdk')
const {InventoryItem} = require("./inventoryItem");

class Item extends Run.Jig {

    static USER_DOES_NOT_MEET_INGREDIENTS_REQUIREMENTS_ERROR_MESSAGE = "The user does not have, or does not have enough quantity of the ingredients necessary to craft this item";

    init(typeId, ingredients, user){
        this._validateUserHasIngredients(ingredients, user);
        this.typeId = typeId;
        this.owner = user.owner;
        user.burnIngredients(ingredients);
    }

    _validateUserHasIngredients(ingredients, user) {
        if (!ingredients.every(ingredient => user.hasEnough(ingredient))) throw new Error(Item.USER_DOES_NOT_MEET_INGREDIENTS_REQUIREMENTS_ERROR_MESSAGE)
    }

    send(to){
        this.owner = to;
    }

}

module.exports = { Item }
Item.deps = { InventoryItem }
