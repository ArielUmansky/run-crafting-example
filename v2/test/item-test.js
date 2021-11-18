var chai  = require('chai');
var expect  = chai.expect;
const Run = require('run-sdk')
const {Item} = require("../jigs/item");
const {User} = require("../jigs/user");
const {Ingredient} = require("../jigs/ingredient");
const {InventoryItem} = require("../jigs/inventoryItem");

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const bsv = require("bsv");
const run = new Run({ network: 'mock' });

describe('Item', () => {

    before(async () => {
        run.deploy(Ingredient);
        run.deploy(Item);
        run.deploy(InventoryItem);
        run.deploy(User);
        await run.sync();
    });

    describe('#init', () => {
        let typeId = "Rice";
        let newItemType = "Onigiri";
        let user;
        let ingredients;
        let item;

        let ingredient;
        let ingredientQuantity = 2;
        let anotherIngredient;
        let anotherTypeId = "Algae";
        let anotherIngredientQuantity = 1;

        let ingredientItem;
        let anotherIngredientItem;

        let userInventoryItem;
        let anotherUserInventoryItem;


        beforeEach(async () => {
            user = new User();
            await user.sync();
        });

        const subject = async () => {
            item = new Item(newItemType, ingredients, user);
            await item.sync();
            return item;
        };

        describe('on successful scenarios', () => {

            describe('like when there are no specified ingredients', () => {

                beforeEach(async () => {
                   ingredients = [];
                });

                it('creates the item with the correct fields', async () => {
                    const createdItem = await subject();
                    expect(createdItem.typeId).to.eq(newItemType);
                });

                it('makes the user owner of the item', async () => {
                    expect(user.has(newItemType)).to.eq(false);
                    const createdItem = await subject()
                    expect(createdItem.owner).to.eq(user.owner);
                });

            });

            describe('like when there are specified ingredients', () => {

                beforeEach(async () => {
                    user = new User();
                    await user.sync();
                    const anotherUserAddress = bsv.PrivateKey.fromRandom().toAddress().toString();
                    user.send(anotherUserAddress);
                    await user.sync();

                    ingredient = new Ingredient(typeId, ingredientQuantity);
                    anotherIngredient = new Ingredient(anotherTypeId, anotherIngredientQuantity);
                    await ingredient.sync();
                    await anotherIngredient.sync();
                    ingredients = [ingredient, anotherIngredient];

                    ingredientItem = new Item(typeId, [], user);
                    anotherIngredientItem = new Item(anotherTypeId, [], user);
                    await ingredientItem.sync();
                    await anotherIngredientItem.sync();

                    userInventoryItem = new InventoryItem(ingredientItem, ingredientQuantity)
                    anotherUserInventoryItem = new InventoryItem(anotherIngredientItem, anotherIngredientQuantity)
                    await userInventoryItem.sync();
                    await anotherUserInventoryItem.sync();

                    ingredientItem.send(anotherUserAddress);
                    anotherIngredientItem.send(anotherUserAddress);
                    userInventoryItem.send(anotherUserAddress);
                    anotherUserInventoryItem.send(anotherUserAddress);
                    await ingredientItem.sync();
                    await anotherIngredientItem.sync();
                    await userInventoryItem.sync();
                    await anotherUserInventoryItem.sync();

                    user.addItem(userInventoryItem);
                    user.addItem(anotherUserInventoryItem);
                    user.sync();
                });

                it('creates the item with the correct fields', async () => {
                    const createdItem = await subject();
                    expect(createdItem.typeId).to.eq(newItemType);
                });

                it('makes the user owner of the item', async () => {
                    expect(user.has(newItemType)).to.eq(false);
                    const createdItem = await subject()
                    expect(createdItem.owner).to.eq(user.owner);
                });

                it('burns the items needed to craft the new one', async () => {
                    expect(user.has(typeId)).to.eq(true);
                    expect(user.has(anotherTypeId)).to.eq(true);
                    await subject()
                    expect(user.has(typeId)).to.eq(false);
                    expect(user.has(anotherTypeId)).to.eq(false);
                });

                describe('if the user has more quantity of an ingredient', () => {
                    let remainder = 2
                    beforeEach(async () => {
                        user = new User();
                        await user.sync();

                        userInventoryItem = new InventoryItem(ingredientItem, ingredientQuantity + remainder)
                        anotherUserInventoryItem = new InventoryItem(anotherIngredientItem, anotherIngredientQuantity)
                        await userInventoryItem.sync();
                        await anotherUserInventoryItem.sync();

                        user.addItem(userInventoryItem);
                        user.addItem(anotherUserInventoryItem);
                        user.sync();
                    });

                    it('burns the items needed to craft the new one', async () => {
                        expect(user.has(typeId)).to.eq(true);
                        await subject();
                        const remainderItem = user.getInventoryItemByType(typeId);
                        expect(remainderItem.quantity).to.eq(remainder);
                    });
                });

            });
        });

        describe('on unsuccessful scenarios', () => {

            describe('like when the user does not have one of the specified ingredients', () => {

                beforeEach(async () => {
                    user = new User();
                    await user.sync();

                    userInventoryItem = new InventoryItem(ingredientItem, ingredientQuantity)
                    await userInventoryItem.sync();
                    user.addItem(userInventoryItem);
                    user.sync();
                });

                it('throws the expected error', async() => {
                    expect(subject()).to.eventually.be.rejectedWith(Item.USER_DOES_NOT_MEET_INGREDIENTS_REQUIREMENTS_ERROR_MESSAGE);
                });

                it('does not create the new item', async () => {
                    expect(user.has(newItemType)).to.eq(false);
                    try{
                        await subject();
                        fail('the test should have failed');
                    } catch(e) {
                        expect(user.has(newItemType)).to.eq(false);
                    }
                });

                it('does not affect users inventory', async () => {
                    expect(user.getInventory().length).to.eq(1);
                    try{
                        await subject();
                        fail('the test should have failed');
                    } catch(e) {
                        expect(user.getInventory().length).to.eq(1);
                    }
                });

            });

            describe('like when the user does not have enough of one of the specified ingredients', () => {

                beforeEach(async () => {
                    user = new User();
                    await user.sync();

                    userInventoryItem = new InventoryItem(ingredientItem, ingredientQuantity - 1)
                    anotherUserInventoryItem = new InventoryItem(anotherIngredientItem, anotherIngredientQuantity)
                    await userInventoryItem.sync();
                    await anotherUserInventoryItem.sync();

                    user.addItem(userInventoryItem);
                    user.addItem(anotherUserInventoryItem);
                    user.sync();
                });

                it('throws the expected error', async() => {
                    expect(subject()).to.eventually.be.rejectedWith(Item.USER_DOES_NOT_MEET_INGREDIENTS_REQUIREMENTS_ERROR_MESSAGE);
                });

                it('does not create the new item', async () => {
                    expect(user.has(newItemType)).to.eq(false);
                    try{
                        await subject();
                        fail('the test should have failed');
                    } catch(e) {
                        expect(user.has(newItemType)).to.eq(false);
                    }
                });

                it('does not affect users inventory', async () => {
                    expect(user.getInventory().length).to.eq(2);
                    try{
                        await subject();
                        fail('the test should have failed');
                    } catch(e) {
                        expect(user.getInventory().length).to.eq(2);
                    }
                });

            });
        });

    });


});

