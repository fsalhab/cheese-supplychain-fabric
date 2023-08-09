"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * This file contains all the error handling for Fabric transactions, including
 * whether a transaction should be retried.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.isDuplicateTransactionError = exports.isErrorLike = exports.getRetryAction = exports.RetryAction = exports.CheeseNotFoundError = exports.CheeseExistsError = exports.TransactionNotFoundError = exports.ContractError = void 0;
var fabric_network_1 = require("fabric-network");
var logger_1 = require("./logger");
/**
 * Base type for errors from the smart contract.
 *
 * These errors will not be retried.
 */
var ContractError = /** @class */ (function (_super) {
    __extends(ContractError, _super);
    function ContractError(message, transactionId) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, ContractError.prototype);
        _this.name = 'TransactionError';
        _this.transactionId = transactionId;
        return _this;
    }
    return ContractError;
}(Error));
exports.ContractError = ContractError;
/**
 * Represents the error which occurs when the transaction being submitted or
 * evaluated is not implemented in a smart contract.
 */
var TransactionNotFoundError = /** @class */ (function (_super) {
    __extends(TransactionNotFoundError, _super);
    function TransactionNotFoundError(message, transactionId) {
        var _this = _super.call(this, message, transactionId) || this;
        Object.setPrototypeOf(_this, TransactionNotFoundError.prototype);
        _this.name = 'TransactionNotFoundError';
        return _this;
    }
    return TransactionNotFoundError;
}(ContractError));
exports.TransactionNotFoundError = TransactionNotFoundError;
/**
 * Represents the error which occurs in the basic asset transfer smart contract
 * implementation when an asset already exists.
 */
var CheeseExistsError = /** @class */ (function (_super) {
    __extends(CheeseExistsError, _super);
    function CheeseExistsError(message, transactionId) {
        var _this = _super.call(this, message, transactionId) || this;
        Object.setPrototypeOf(_this, CheeseExistsError.prototype);
        _this.name = 'CheeseExistsError';
        return _this;
    }
    return CheeseExistsError;
}(ContractError));
exports.CheeseExistsError = CheeseExistsError;
/**
 * Represents the error which occurs in the basic asset transfer smart contract
 * implementation when an asset does not exist.
 */
var CheeseNotFoundError = /** @class */ (function (_super) {
    __extends(CheeseNotFoundError, _super);
    function CheeseNotFoundError(message, transactionId) {
        var _this = _super.call(this, message, transactionId) || this;
        Object.setPrototypeOf(_this, CheeseNotFoundError.prototype);
        _this.name = 'CheeseNotFoundError';
        return _this;
    }
    return CheeseNotFoundError;
}(ContractError));
exports.CheeseNotFoundError = CheeseNotFoundError;
/**
 * Enumeration of possible retry actions.
 */
var RetryAction;
(function (RetryAction) {
    /**
     * Transactions should be retried using the same transaction ID to protect
     * against duplicate transactions being committed if a timeout error occurs
     */
    RetryAction[RetryAction["WithExistingTransactionId"] = 0] = "WithExistingTransactionId";
    /**
     * Transactions which could not be committed due to other errors require a
     * new transaction ID when retrying
     */
    RetryAction[RetryAction["WithNewTransactionId"] = 1] = "WithNewTransactionId";
    /**
     * Transactions that failed due to a duplicate transaction error, or errors
     * from the smart contract, should not be retried
     */
    RetryAction[RetryAction["None"] = 2] = "None";
})(RetryAction = exports.RetryAction || (exports.RetryAction = {}));
/**
 * Get the required transaction retry action for an error.
 *
 * For this sample transactions are considered retriable if they fail with any
 * error, *except* for duplicate transaction errors, or errors from the smart
 * contract.
 *
 * You might decide to retry transactions which fail with specific errors
 * instead, for example:
 *   - MVCC_READ_CONFLICT
 *   - PHANTOM_READ_CONFLICT
 *   - ENDORSEMENT_POLICY_FAILURE
 *   - CHAINCODE_VERSION_CONFLICT
 *   - EXPIRED_CHAINCODE
 */
var getRetryAction = function (err) {
    if ((0, exports.isDuplicateTransactionError)(err) || err instanceof ContractError) {
        return RetryAction.None;
    }
    else if (err instanceof fabric_network_1.TimeoutError) {
        return RetryAction.WithExistingTransactionId;
    }
    return RetryAction.WithNewTransactionId;
};
exports.getRetryAction = getRetryAction;
/**
 * Type guard to make catching unknown errors easier
 */
var isErrorLike = function (err) {
    return (err != undefined &&
        err != null &&
        typeof err.name === 'string' &&
        typeof err.message === 'string' &&
        (err.stack === undefined ||
            typeof err.stack === 'string'));
};
exports.isErrorLike = isErrorLike;
/**
 * Checks whether an error was caused by a duplicate transaction.
 *
 * This is ...painful.
 */
var isDuplicateTransactionError = function (err) {
    var _a;
    logger_1.logger.debug({ err: err }, 'Checking for duplicate transaction error');
    if (err === undefined || err === null)
        return false;
    var isDuplicate;
    if (typeof err.transactionCode === 'string') {
        // Checking whether a commit failure is caused by a duplicate transaction
        // is straightforward because the transaction code should be available
        isDuplicate = err.transactionCode === 'DUPLICATE_TXID';
    }
    else {
        // Checking whether an endorsement failure is caused by a duplicate
        // transaction is only possible by processing error strings, which is not ideal.
        var endorsementError = err;
        isDuplicate = (_a = endorsementError === null || endorsementError === void 0 ? void 0 : endorsementError.errors) === null || _a === void 0 ? void 0 : _a.some(function (err) {
            var _a;
            return (_a = err === null || err === void 0 ? void 0 : err.endorsements) === null || _a === void 0 ? void 0 : _a.some(function (endorsement) { var _a; return (_a = endorsement === null || endorsement === void 0 ? void 0 : endorsement.details) === null || _a === void 0 ? void 0 : _a.startsWith('duplicate transaction found'); });
        });
    }
    return isDuplicate === true;
};
exports.isDuplicateTransactionError = isDuplicateTransactionError;
/**
 * Matches asset already exists error strings from the asset contract
 *
 * The regex needs to match the following error messages:
 *   - "the asset %s already exists"
 *   - "The asset ${id} already exists"
 *   - "Asset %s already exists"
 */
var matchCheeseAlreadyExistsMessage = function (message) {
    var cheeseAlreadyExistsRegex = /([tT]he )?[aA]sset \w* already exists/g;
    var cheeseAlreadyExistsMatch = message.match(cheeseAlreadyExistsRegex);
    logger_1.logger.debug({ message: message, result: cheeseAlreadyExistsMatch }, 'Checking for cheese already exists message');
    if (cheeseAlreadyExistsMatch !== null) {
        return cheeseAlreadyExistsMatch[0];
    }
    return null;
};
/**
 * Matches asset does not exist error strings from the asset contract
 *
 * The regex needs to match the following error messages:
 *   - "the asset %s does not exist"
 *   - "The asset ${id} does not exist"
 *   - "Asset %s does not exist"
 */
var matchCheeseDoesNotExistMessage = function (message) {
    var cheeseDoesNotExistRegex = /([tT]he )?[cC]heese \w* does not exist/g;
    var cheeseDoesNotExistMatch = message.match(cheeseDoesNotExistRegex);
    logger_1.logger.debug({ message: message, result: cheeseDoesNotExistMatch }, 'Checking for cheese does not exist message');
    if (cheeseDoesNotExistMatch !== null) {
        return cheeseDoesNotExistMatch[0];
    }
    return null;
};
/**
 * Matches transaction does not exist error strings from the contract API
 *
 * The regex needs to match the following error messages:
 *   - "Failed to get transaction with id %s, error Entry not found in index"
 *   - "Failed to get transaction with id %s, error no such transaction ID [%s] in index"
 */
var matchTransactionDoesNotExistMessage = function (message) {
    var transactionDoesNotExistRegex = /Failed to get transaction with id [^,]*, error (?:(?:Entry not found)|(?:no such transaction ID \[[^\]]*\])) in index/g;
    var transactionDoesNotExistMatch = message.match(transactionDoesNotExistRegex);
    logger_1.logger.debug({ message: message, result: transactionDoesNotExistMatch }, 'Checking for transaction does not exist message');
    if (transactionDoesNotExistMatch !== null) {
        return transactionDoesNotExistMatch[0];
    }
    return null;
};
/**
 * Handles errors from evaluating and submitting transactions.
 *
 * Smart contract errors from the basic asset transfer samples do not use
 * error codes so matching strings is the only option, which is not ideal.
 *
 * Note: the error message text is not the same for the Go, Java, and
 * Javascript implementations of the chaincode!
 */
var handleError = function (transactionId, err) {
    logger_1.logger.debug({ transactionId: transactionId, err: err }, 'Processing error');
    if ((0, exports.isErrorLike)(err)) {
        var cheeseAlreadyExistsMatch = matchCheeseAlreadyExistsMessage(err.message);
        if (cheeseAlreadyExistsMatch !== null) {
            return new CheeseExistsError(cheeseAlreadyExistsMatch, transactionId);
        }
        var cheeseDoesNotExistMatch = matchCheeseDoesNotExistMessage(err.message);
        if (cheeseDoesNotExistMatch !== null) {
            return new CheeseNotFoundError(cheeseDoesNotExistMatch, transactionId);
        }
        var transactionDoesNotExistMatch = matchTransactionDoesNotExistMessage(err.message);
        if (transactionDoesNotExistMatch !== null) {
            return new TransactionNotFoundError(transactionDoesNotExistMatch, transactionId);
        }
    }
    return err;
};
exports.handleError = handleError;
//# sourceMappingURL=errors.js.map