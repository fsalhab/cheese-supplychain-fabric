/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * This sample is intended to work with the basic asset transfer
 * chaincode which imposes some constraints on what is possible here.
 *
 * For example,
 *  - There is no validation for Asset IDs
 *  - There are no error codes from the chaincode
 *
 * To avoid timeouts, long running tasks should be decoupled from HTTP request
 * processing
 *
 * Submit transactions can potentially be very long running, especially if the
 * transaction fails and needs to be retried one or more times
 *
 * To allow requests to respond quickly enough, this sample queues submit
 * requests for processing asynchronously and immediately returns 202 Accepted
 */

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Contract } from 'fabric-network';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { Queue } from 'bullmq';
import { CheeseNotFoundError } from './errors';
import { evaluateTransaction } from './fabric';
import { addSubmitTransactionJob } from './jobs';
import { logger } from './logger';

const { ACCEPTED, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } =
  StatusCodes;

export const cheesesRouter = express.Router();

cheesesRouter.get('/', async (req: Request, res: Response) => {
  logger.debug('Get all cheeses request received');
  try {
    const mspId = req.user as string;
    const contract = req.app.locals[mspId]?.cheeseContract as Contract;

    const data = await evaluateTransaction(contract, 'getAllCheeses');
    let cheeses = [];
    if (data.length > 0) {
      cheeses = JSON.parse(data.toString());
    }

    return res.status(OK).json(cheeses);
  } catch (err) {
    logger.error({ err }, 'Error processing get all cheeses request');
    return res.status(INTERNAL_SERVER_ERROR).json({
      status: getReasonPhrase(INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
    });
  }
});

cheesesRouter.post(
  '/',
  body().isObject().withMessage('body must contain a cheese object'),
  body('Name', 'must be a string').notEmpty(),
  body('Manufacturer', 'must be a string').notEmpty(),
  body('Quantity', 'must be a number').isNumeric(),
  async (req: Request, res: Response) => {
    logger.debug(req.body, 'Create cheese request received');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(BAD_REQUEST).json({
        status: getReasonPhrase(BAD_REQUEST),
        reason: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        timestamp: new Date().toISOString(),
        errors: errors.array(),
      });
    }

    const mspId = req.user as string;
    const cheeseId = `cheese${Date.now()}`;

    try {
      const submitQueue = req.app.locals.jobq as Queue;
      const jobId = await addSubmitTransactionJob(
        submitQueue,
        mspId,
        'createCheese',
        cheeseId,
        req.body.Name,
        req.body.Manufacturer,
        req.body.ProductionDate
      );

      return res.status(ACCEPTED).json({
        status: getReasonPhrase(ACCEPTED),
        jobId: jobId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      logger.error(
        { err },
        'Error processing create cheese request for cheese ID %s',
        cheeseId
      );

      return res.status(INTERNAL_SERVER_ERROR).json({
        status: getReasonPhrase(INTERNAL_SERVER_ERROR),
        timestamp: new Date().toISOString(),
      });
    }
  }
);

cheesesRouter.options('/:cheeseId', async (req: Request, res: Response) => {
  const cheeseId = req.params.cheeseId;
  logger.debug('Cheese options request received for cheese ID %s', cheeseId);

  try {
    const mspId = req.user as string;
    const contract = req.app.locals[mspId]?.cheeseContract as Contract;

    const data = await evaluateTransaction(contract, 'cheeseExists', cheeseId);
    const exists = data.toString() === 'true';

    if (exists) {
      return res
        .status(OK)
        .set({
          Allow: 'DELETE,GET,OPTIONS,PATCH,PUT',
        })
        .json({
          status: getReasonPhrase(OK),
          timestamp: new Date().toISOString(),
        });
    } else {
      return res.status(NOT_FOUND).json({
        status: getReasonPhrase(NOT_FOUND),
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    logger.error(
      { err },
      'Error processing cheese options request for cheese ID %s',
      cheeseId
    );
    return res.status(INTERNAL_SERVER_ERROR).json({
      status: getReasonPhrase(INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
    });
  }
});

cheesesRouter.get('/:cheeseId', async (req: Request, res: Response) => {
  const cheeseId = req.params.cheeseId;
  logger.debug('Read cheese request received for cheese ID %s', cheeseId);

  try {
    const mspId = req.user as string;
    const contract = req.app.locals[mspId]?.cheeseContract as Contract;

    const data = await evaluateTransaction(contract, 'getCheese', cheeseId);
    const cheese = JSON.parse(data.toString());

    return res.status(OK).json(cheese);
  } catch (err) {
    logger.error(
      { err },
      'Error processing read cheese request for cheese ID %s',
      cheeseId
    );

    if (err instanceof CheeseNotFoundError) {
      return res.status(NOT_FOUND).json({
        status: getReasonPhrase(NOT_FOUND),
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(INTERNAL_SERVER_ERROR).json({
      status: getReasonPhrase(INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
    });
  }
});

cheesesRouter.put(
  '/:cheeseId',
  body().isObject().withMessage('body must contain a cheese object'),
  body('ID', 'must be a string').notEmpty(),
  body('NewState', 'must be a string').notEmpty(),
  async (req: Request, res: Response) => {
    logger.debug(req.body, 'Update cheese request received');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(BAD_REQUEST).json({
        status: getReasonPhrase(BAD_REQUEST),
        reason: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        timestamp: new Date().toISOString(),
        errors: errors.array(),
      });
    }

    if (req.params.cheeseId != req.body.ID) {
      return res.status(BAD_REQUEST).json({
        status: getReasonPhrase(BAD_REQUEST),
        reason: 'CHEESE_ID_MISMATCH',
        message: 'Cheese IDs must match',
        timestamp: new Date().toISOString(),
      });
    }

    const mspId = req.user as string;
    const cheeseId = req.params.cheeseId;

    try {
      const submitQueue = req.app.locals.jobq as Queue;
      const jobId = await addSubmitTransactionJob(
        submitQueue,
        mspId,
        'updateCheese',
        cheeseId,
        req.body.newState
      );

      return res.status(ACCEPTED).json({
        status: getReasonPhrase(ACCEPTED),
        jobId: jobId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      logger.error(
        { err },
        'Error processing update cheese request for cheese ID %s',
        cheeseId
      );

      return res.status(INTERNAL_SERVER_ERROR).json({
        status: getReasonPhrase(INTERNAL_SERVER_ERROR),
        timestamp: new Date().toISOString(),
      });
    }
  }
);
