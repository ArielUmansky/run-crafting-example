var chai  = require('chai');
var expect  = chai.expect;
const Run = require('run-sdk')
const {InventoryItem} = require("../jigs/inventoryItem");
const {Item} = require("../jigs/item");
const {Recipe} = require("../jigs/recipe");
const {User} = require("../jigs/user");
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const run = new Run({ network: 'mock' });


describe('Recipes', () => {
    let recipe;
    const itemType = "Rice";
    const anotherItemType = "Algae";
    const resultItemType = "Onigiri";
    let user;

    before(async () => {
        run.deploy(InventoryItem);
        run.deploy(Recipe);
        run.deploy(Item);
        run.deploy(User);
        await run.sync();

        recipe = new Recipe();
    });

    describe('#addIngredient', () => {
        let ingredientQuantity = 5;
        let ingredient;


        beforeEach(async () => {
            user = new User();
            await user.sync();
            ingredient = new InventoryItem(new Item(itemType), ingredientQuantity, recipe.owner);
        });

        const subject = async (ingredient) => {
            recipe.addIngredient(ingredient)
        };

        it('stores it in the recipe',async () => {
            expect(recipe.getIngredients().length).to.eq(0);
            await subject(ingredient)
            expect(recipe.getIngredients().length).to.eq(1);
        });

    });

    describe('#applyFor', () => {
        let recipe;
        let recipeResultItem;
        let ingredient;
        let anotherIngredient;
        let ingredientQuantity = 3;
        let anotherIngredientQuantity = 5;
        let resultItemQuantity = 1;


        beforeEach(async () => {
            recipe = new Recipe();
            user = new User();
            await recipe.sync();

            // TODO: Ingredients in Recipes might not be InventoryItems

            ingredient = new InventoryItem(new Item(itemType), ingredientQuantity, recipe.owner);
            anotherIngredient = new InventoryItem(new Item(anotherItemType), anotherIngredientQuantity, recipe.owner);
            recipeResultItem = new InventoryItem(new Item(resultItemType), resultItemQuantity, recipe.owner);

            recipe.addIngredient(ingredient);
            recipe.addIngredient(anotherIngredient);
            recipe.setResultItem(recipeResultItem);
            await recipe.sync();
        });

        const subject = async (recipe, user) => {
            recipe.applyFor(user);
            await recipe.sync();
            await user.sync();
        };

        describe('on successful scenarios', () => {

            beforeEach(async () => {
                user.addItem(ingredient);
                user.addItem(anotherIngredient);
                await user.sync();
            });

            it('adds the new item to owners inventory', async () => {
                expect(user.owns(resultItemType)).to.eq(false);
                await subject(recipe, user);
                expect(user.owns(resultItemType, resultItemQuantity)).to.eq(true);
            });

            it('removes the used items from owners inventory', async () => {
                expect(user.owns(itemType)).to.eq(true);
                expect(user.owns(anotherItemType)).to.eq(true);
                await subject(recipe, user);
                expect(user.owns(itemType)).to.eq(false);
                expect(user.owns(anotherItemType)).to.eq(false);
            });

        });

        describe('on unsuccessful scenarios', () => {

            describe('like when the user does not have the specified items', () => {

                beforeEach(async () => {
                    user.addItem(ingredient);
                    await user.sync();
                });

                it('throws the expected error', async () => {
                    expect(subject(recipe, user)).to.eventually.be.rejectedWith(Recipe.USER_DOES_NOT_COMPLY_WITH_RECIPE_SPECS_ERROR_MESSAGE);
                });

                it('does not modify the users inventory', async () => {
                    expect(user.getInventory().length).to.eq(1);
                    try {
                        await subject(recipe, user);
                        fail('This test should have failed');
                    } catch(e){
                        expect(user.getInventory().length).to.eq(1);
                    }
                })

            });

            describe('like when the user does not have enough quantity of one of the specified items', () => {

                beforeEach(async () => {
                    anotherIngredient = new InventoryItem(new Item(anotherItemType), anotherIngredientQuantity - 1, recipe.owner);
                    user.addItem(ingredient);
                    user.addItem(anotherIngredient);
                    await user.sync();
                });

                it('throws the expected error', async () => {
                    expect(subject(recipe, user)).to.eventually.be.rejectedWith(Recipe.USER_DOES_NOT_COMPLY_WITH_RECIPE_SPECS_ERROR_MESSAGE);
                });

                it('does not modify the users inventory', async () => {
                    expect(user.getInventory().length).to.eq(2);
                    try {
                        await subject(recipe, user);
                        fail('This test should have failed');
                    } catch(e){
                        expect(user.getInventory().length).to.eq(2);
                    }
                });

            });

        });
    });

});

