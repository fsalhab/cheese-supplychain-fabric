"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheeseSupplyChainContract = void 0;
/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
const fabric_contract_api_1 = require("fabric-contract-api");
const json_stringify_deterministic_1 = __importDefault(require("json-stringify-deterministic"));
const sort_keys_recursive_1 = __importDefault(require("sort-keys-recursive"));
let CheeseSupplyChainContract = class CheeseSupplyChainContract extends fabric_contract_api_1.Contract {
    // CreateCheese creates a new cheese
    async createCheese(ctx, cheeseId, cheeseName, manufacturer, productionDate) {
        const exists = await this.cheeseExists(ctx, cheeseId);
        if (exists) {
            throw new Error(`The cheese ${cheeseId} already exists`);
        }
        const cheese = {
            cheeseId,
            cheeseName,
            manufacturer,
            productionDate,
            currentState: 'PRODUCED',
            history: [],
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(cheeseId, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(cheese))));
    }
    // GetCheese returns the cheese stored in the world state with given id.
    async getCheese(ctx, cheeseId) {
        const cheeseJSON = await ctx.stub.getState(cheeseId); // get the asset from chaincode state
        if (!cheeseJSON || cheeseJSON.length === 0) {
            throw new Error(`The cheese ${cheeseId} does not exist`);
        }
        return cheeseJSON.toString();
    }
    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async updateCheeseState(ctx, cheeseId, newState) {
        const cheeseJSON = await ctx.stub.getState(cheeseId); // get the asset from chaincode state
        if (!cheeseJSON || cheeseJSON.length === 0) {
            throw new Error(`The asset ${cheeseId} does not exist`);
        }
        const cheese = JSON.parse(cheeseJSON.toString());
        cheese.currentState = newState;
        cheese.history.push({
            timestamp: ctx.stub.getDateTimestamp(),
            state: newState,
        });
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(cheeseId, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(cheese))));
    }
    // cheeseExists returns true when cheese with given ID exists in world state.
    async cheeseExists(ctx, cheeseId) {
        const cheeseJSON = await ctx.stub.getState(cheeseId);
        return cheeseJSON && cheeseJSON.length > 0;
    }
};
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CheeseSupplyChainContract.prototype, "createCheese", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], CheeseSupplyChainContract.prototype, "getCheese", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], CheeseSupplyChainContract.prototype, "updateCheeseState", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], CheeseSupplyChainContract.prototype, "cheeseExists", null);
CheeseSupplyChainContract = __decorate([
    (0, fabric_contract_api_1.Info)({
        title: 'Cheese Supply Chain',
        description: 'Smart contract for cheese supply chain',
    })
], CheeseSupplyChainContract);
exports.CheeseSupplyChainContract = CheeseSupplyChainContract;
//# sourceMappingURL=cheeseSupplyChain.js.map