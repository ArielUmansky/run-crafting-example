var expect  = require('chai').expect;
const Run = require('run-sdk')
const {InventoryItem} = require("../jigs/inventoryItem");
const {Item} = require("../jigs/item");
const {Recipe} = require("../jigs/recipe");
const {User} = require("../jigs/user");
const bsv = require("bsv");
const run = new Run({ network: 'mock' });


describe('Users', () => {
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
    });

    describe('#addItem', () => {
        let inventoryItem;
        let itemQuantity = 5;

        beforeEach(async () => {
            user = new User();
            await user.sync();
            inventoryItem = new InventoryItem(new Item(itemType), itemQuantity, user.owner);
        });

        const subject = async () => {
            user.addItem(inventoryItem);
        };

        it('stores it in the users inventory',async () => {
            expect(user.owns(itemType, itemQuantity)).to.eq(false);
            await subject()
            expect(user.owns(itemType, itemQuantity)).to.eq(true);
        });

        describe('if the inventory item is not previously owned by the user', async () => {
            let anotherUser;

            beforeEach(async() => {
               const anotherUserAddress = bsv.PrivateKey.fromRandom().toAddress().toString();
               inventoryItem.send(anotherUserAddress);
               await inventoryItem.sync();
            });

            it('does not add the inventory item to the users inventory', async () => {
                console.log();
                expect(user.owns(itemType, itemQuantity)).to.eq(false);
                try {
                    await subject();
                    fail('This test should have failed');
                } catch(e){
                    expect(user.owns(itemType, itemQuantity)).to.eq(false)
                }
            });
        });

    });

});

