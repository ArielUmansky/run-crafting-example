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


describe('Users', () => {
    const itemType = "Rice";
    let user;

    before(async () => {
        run.deploy(Ingredient);
        run.deploy(Item);
        run.deploy(InventoryItem);
        run.deploy(User);
        await run.sync();
    });

    describe('#addItem', () => {
        let item;
        let inventoryItem;
        let itemQuantity = 5;

        beforeEach(async () => {
            user = new User();
            await user.sync();

            item = new Item(itemType, [], user);
            await item.sync();
            inventoryItem = new InventoryItem(item, itemQuantity);
            await inventoryItem.sync();
        });

        const subject = async () => {
            user.addItem(inventoryItem);
            await user.sync();
        };

        it('stores it in the users inventory',async () => {
            expect(user.has(itemType)).to.eq(false);
            await subject();
            expect(user.has(itemType)).to.eq(true);
        });

        describe('if the inventory item is not previously owned by the user', async () => {
            let anotherUser;

            beforeEach(async() => {
               const anotherUserAddress = bsv.PrivateKey.fromRandom().toAddress().toString();
               inventoryItem.send(anotherUserAddress);
               await inventoryItem.sync();
            });

            it('throws the expected error', async() => {
                expect(subject()).to.eventually.be.rejectedWith(User.ITEM_DOES_NOT_BELONG_TO_THE_USER);
            });


            it('does not add the inventory item to the users inventory', async () => {
                expect(user.has(itemType)).to.eq(false);
                try {
                    await subject();
                    fail('This test should have failed');
                } catch(e){
                    expect(user.has(itemType)).to.eq(false);
                }
            });
        });

    });

});

