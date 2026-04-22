import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";

import { authService } from "../services/auth.service";
import { createApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { getRequestContext } from "../utils/request-metadata.util";

const refreshCookieName = "refreshToken";

export const authController = {
  register: asyncHandler(async (request: Request, response: Response) => {
    const result = await authService.register(request.body, getRequestContext(request));

    response
      .cookie(
        refreshCookieName,
        result.tokens.refreshToken,
        authService.getRefreshCookieOptions(),
      )
      .status(StatusCodes.CREATED)
      .json(
        createApiResponse("User registered successfully.", {
          accessToken: result.tokens.accessToken,
          user: result.user,
        }, request.id ? { requestId: request.id } : undefined),
      );
  }),

  login: asyncHandler(async (request: Request, response: Response) => {
    const result = await authService.login(request.body, getRequestContext(request));

    response
      .cookie(
        refreshCookieName,
        result.tokens.refreshToken,
        authService.getRefreshCookieOptions(),
      )
      .status(StatusCodes.OK)
      .json(
        createApiResponse("Login successful.", {
          accessToken: result.tokens.accessToken,
          user: result.user,
        }, request.id ? { requestId: request.id } : undefined),
      );
  }),

  refresh: asyncHandler(async (request: Request, response: Response) => {
    const result = await authService.refreshTokens(
      request.body,
      getRequestContext(request),
      request.cookies[refreshCookieName] as string | undefined,
    );

    response
      .cookie(
        refreshCookieName,
        result.tokens.refreshToken,
        authService.getRefreshCookieOptions(),
      )
      .status(StatusCodes.OK)
      .json(
        createApiResponse("Access token refreshed successfully.", {
          accessToken: result.tokens.accessToken,
          user: result.user,
        }, request.id ? { requestId: request.id } : undefined),
      );
  }),

  logout: asyncHandler(async (request: Request, response: Response) => {
    await authService.logout(
      request.body,
      getRequestContext(request),
      request.cookies[refreshCookieName] as string | undefined,
    );

    response
      .clearCookie(refreshCookieName, authService.getRefreshCookieOptions())
      .status(StatusCodes.OK)
      .json(createApiResponse("Logout successful.", undefined, request.id ? { requestId: request.id } : undefined));
  }),
};
