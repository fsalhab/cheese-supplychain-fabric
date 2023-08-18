/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction,
} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';

interface Cheese {
  cheeseId: string;
  cheeseName: string;
  manufacturer: string;
  quantity: number;
  productionDate: string;
  currentState: string;
  history: Array<{ timestamp: Date; state: string }>;
}

@Info({
  title: 'Cheese Supply Chain',
  description: 'Smart contract for cheese supply chain',
})
export class CheeseSupplyChainContract extends Contract {
  // CreateCheese creates a new cheese
  @Transaction()
  public async createCheese(
    ctx: Context,
    cheeseId: string,
    cheeseName: string,
    quantity: number,
    manufacturer: string,
    productionDate: string
  ): Promise<void> {
    const exists = await this.cheeseExists(ctx, cheeseId);
    if (exists) {
      throw new Error(`The cheese ${cheeseId} already exists`);
    }

    const cheese: Cheese = {
      cheeseId,
      cheeseName,
      manufacturer,
      quantity,
      productionDate,
      currentState: 'PRODUCED',
      history: [],
    };
    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(
      cheeseId,
      Buffer.from(stringify(sortKeysRecursive(cheese)))
    );
  }

  // GetCheese returns the cheese stored in the world state with given id.
  @Transaction(false)
  public async getCheese(ctx: Context, cheeseId: string): Promise<string> {
    const cheeseJSON = await ctx.stub.getState(cheeseId); // get the asset from chaincode state
    if (!cheeseJSON || cheeseJSON.length === 0) {
      throw new Error(`The cheese ${cheeseId} does not exist`);
    }
    return cheeseJSON.toString();
  }

  // UpdateAsset updates an existing asset in the world state with provided parameters.
  @Transaction()
  public async updateCheeseState(
    ctx: Context,
    cheeseId: string,
    newState: string
  ): Promise<void> {
    const cheeseJSON = await ctx.stub.getState(cheeseId); // get the asset from chaincode state
    if (!cheeseJSON || cheeseJSON.length === 0) {
      throw new Error(`The cheese ${cheeseId} does not exist`);
    }

    const cheese: Cheese = JSON.parse(cheeseJSON.toString());
    cheese.currentState = newState;
    cheese.history.push({
      timestamp: ctx.stub.getDateTimestamp(),
      state: newState,
    });

    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    return ctx.stub.putState(
      cheeseId,
      Buffer.from(stringify(sortKeysRecursive(cheese)))
    );
  }

  // cheeseExists returns true when cheese with given ID exists in world state.
  @Transaction(false)
  @Returns('boolean')
  public async cheeseExists(ctx: Context, cheeseId: string): Promise<boolean> {
    const cheeseJSON = await ctx.stub.getState(cheeseId);
    return cheeseJSON && cheeseJSON.length > 0;
  }
}
