"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
var express_1 = __importDefault(require("express"));
var http_status_codes_1 = require("http-status-codes");
var fabric_1 = require("./fabric");
var logger_1 = require("./logger");
var config = __importStar(require("./config"));
var jobs_1 = require("./jobs");
var SERVICE_UNAVAILABLE = http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE, OK = http_status_codes_1.StatusCodes.OK;
exports.healthRouter = express_1.default.Router();
/*
 * Example of possible health endpoints for use in a cloud environment
 */
exports.healthRouter.get('/ready', function (_req, res) {
    return res.status(OK).json({
        status: (0, http_status_codes_1.getReasonPhrase)(OK),
        timestamp: new Date().toISOString(),
    });
});
exports.healthRouter.get('/live', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var submitQueue, qsccOrg1, qsccOrg2, err_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                logger_1.logger.debug(req.body, 'Liveness request received');
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                submitQueue = req.app.locals.jobq;
                qsccOrg1 = (_a = req.app.locals[config.mspIdOrg1]) === null || _a === void 0 ? void 0 : _a.qsccContract;
                qsccOrg2 = (_b = req.app.locals[config.mspIdOrg2]) === null || _b === void 0 ? void 0 : _b.qsccContract;
                return [4 /*yield*/, Promise.all([
                        (0, fabric_1.getBlockHeight)(qsccOrg1),
                        (0, fabric_1.getBlockHeight)(qsccOrg2),
                        (0, jobs_1.getJobCounts)(submitQueue),
                    ])];
            case 2:
                _c.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _c.sent();
                logger_1.logger.error({ err: err_1 }, 'Error processing liveness request');
                return [2 /*return*/, res.status(SERVICE_UNAVAILABLE).json({
                        status: (0, http_status_codes_1.getReasonPhrase)(SERVICE_UNAVAILABLE),
                        timestamp: new Date().toISOString(),
                    })];
            case 4: return [2 /*return*/, res.status(OK).json({
                    status: (0, http_status_codes_1.getReasonPhrase)(OK),
                    timestamp: new Date().toISOString(),
                })];
        }
    });
}); });
//# sourceMappingURL=health.router.js.map