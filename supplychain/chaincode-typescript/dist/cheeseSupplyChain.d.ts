import { Context, Contract } from 'fabric-contract-api';
export declare class CheeseSupplyChainContract extends Contract {
    createCheese(ctx: Context, cheeseId: string, cheeseName: string, manufacturer: string, productionDate: string): Promise<void>;
    getCheese(ctx: Context, cheeseId: string): Promise<string>;
    updateCheeseState(ctx: Context, cheeseId: string, newState: string): Promise<void>;
    cheeseExists(ctx: Context, cheeseId: string): Promise<boolean>;
}
