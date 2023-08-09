"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
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
exports.createServer = void 0;
var express_1 = __importDefault(require("express"));
var helmet_1 = __importDefault(require("helmet"));
var http_status_codes_1 = require("http-status-codes");
var passport_1 = __importDefault(require("passport"));
var pino_http_1 = __importDefault(require("pino-http"));
var cheeses_router_1 = require("./cheeses.router");
var auth_1 = require("./auth");
var health_router_1 = require("./health.router");
var jobs_router_1 = require("./jobs.router");
var logger_1 = require("./logger");
var transactions_router_1 = require("./transactions.router");
var cors_1 = __importDefault(require("cors"));
var BAD_REQUEST = http_status_codes_1.StatusCodes.BAD_REQUEST, INTERNAL_SERVER_ERROR = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, NOT_FOUND = http_status_codes_1.StatusCodes.NOT_FOUND;
var createServer = function () { return __awaiter(void 0, void 0, void 0, function () {
    var app;
    return __generator(this, function (_a) {
        app = (0, express_1.default)();
        app.use((0, pino_http_1.default)({
            logger: logger_1.logger,
            customLogLevel: function customLogLevel(res, err) {
                if (res.statusCode >= BAD_REQUEST &&
                    res.statusCode < INTERNAL_SERVER_ERROR) {
                    return 'warn';
                }
                if (res.statusCode >= INTERNAL_SERVER_ERROR || err) {
                    return 'error';
                }
                return 'debug';
            },
        }));
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        // define passport startegy
        passport_1.default.use(auth_1.fabricAPIKeyStrategy);
        // initialize passport js
        app.use(passport_1.default.initialize());
        if (process.env.NODE_ENV === 'development') {
            app.use((0, cors_1.default)());
        }
        if (process.env.NODE_ENV === 'test') {
            // TBC
        }
        if (process.env.NODE_ENV === 'production') {
            app.use((0, helmet_1.default)());
        }
        app.use('/', health_router_1.healthRouter);
        app.use('/api/cheeses', auth_1.authenticateApiKey, cheeses_router_1.cheesesRouter);
        app.use('/api/jobs', auth_1.authenticateApiKey, jobs_router_1.jobsRouter);
        app.use('/api/transactions', auth_1.authenticateApiKey, transactions_router_1.transactionsRouter);
        // For everything else
        app.use(function (_req, res) {
            return res.status(NOT_FOUND).json({
                status: (0, http_status_codes_1.getReasonPhrase)(NOT_FOUND),
                timestamp: new Date().toISOString(),
            });
        });
        // Print API errors
        app.use(function (err, _req, res, _next) {
            logger_1.logger.error(err);
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: (0, http_status_codes_1.getReasonPhrase)(INTERNAL_SERVER_ERROR),
                timestamp: new Date().toISOString(),
            });
        });
        return [2 /*return*/, app];
    });
}); };
exports.createServer = createServer;
//# sourceMappingURL=server.js.map