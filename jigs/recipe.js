const Run = require('run-sdk')
const {InventoryItem} = require("./inventoryItem");
const {Item} = require("./item");


class Recipe extends Run.Jig {
    static USER_DOES_NOT_COMPLY_WITH_RECIPE_SPECS_ERROR_MESSAGE = 'there was an error';

    init() {
        this.ingredients = [];
    }

    addIngredient(inventoryItem) {
        this.ingredients.push(inventoryItem);
    }

    getIngredients() {
        return this.ingredients;
    }

    setResultItem(resultItem){
        this.resultItem = resultItem;
    }

    getResultItem() {
        return this.resultItem;
    }

    applyFor(user){
        this._validateUserMeetsRecipeCriteria(user);
        user.addItem(this._createNewResultItemForUser(user));
        user.removeItemsFromRecipe(this);
    }

    _validateUserMeetsRecipeCriteria(user) {
        if (!this._meetsCriteria(user)) {
            throw new Error(Recipe.USER_DOES_NOT_COMPLY_WITH_RECIPE_SPECS_ERROR_MESSAGE);
        }
    }

    _createNewResultItemForUser(user){
        return new InventoryItem(new Item(this.resultItem.getItemTypeId()), this.resultItem.quantity, user.owner);
    }

    _meetsCriteria(user){
        return this.ingredients.every(ingredient => {
            return user.owns(ingredient.getItemTypeId(), ingredient.quantity);
        });
    }

}

Recipe.deps = { InventoryItem, Item }

module.exports = { Recipe }
