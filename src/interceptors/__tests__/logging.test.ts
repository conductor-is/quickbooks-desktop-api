import Client from "@conductor/client-node/Client";
import type { RequestConfigWithStartTime } from "@conductor/client-node/interceptors/logging";
import {
  createRequestLogObject,
  getDurationStringFromConfig,
  stringifyForLogs,
} from "@conductor/client-node/interceptors/logging";
import { ConductorError } from "@conductor/client-node/utils/error";
import {
  generateMockEndUser,
  generateMockEndUserCreateInput,
} from "@conductor/client-node/utils/test/generators/endUser";
import type { AxiosRequestConfig } from "axios";
import MockAdapter from "axios-mock-adapter";
import util from "node:util";

describe("logging interceptors", () => {
  describe("`verbose` is `true`", () => {
    const client = new Client("mock-api-key", {
      verbose: true,
    });
    // @ts-expect-error -- Accessing a private property for testing.
    const mockAdapter = new MockAdapter(client.httpClient);

    it("logs GET requests", async () => {
      expect.assertions(2);
      mockAdapter.onGet("/end_users").reply(200, [generateMockEndUser()]);

      jest.spyOn(console, "log").mockImplementation();
      await client.endUsers.list();

      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(
        "Conductor request:",
        stringifyForLogs({
          endpoint: "GET /end_users",
        }),
      );
    });

    it("logs POST requests with the input bodies", async () => {
      expect.assertions(2);
      const endUser = generateMockEndUser();
      const endUserInput = generateMockEndUserCreateInput({
        sourceId: endUser.sourceId,
        email: endUser.email,
        name: endUser.name,
      });
      mockAdapter.onPost("/end_users").reply(200, endUser);

      jest.spyOn(console, "log").mockImplementation();
      await client.endUsers.create(endUserInput);

      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(
        "Conductor request:",
        stringifyForLogs({
          endpoint: "POST /end_users",
          body: endUserInput,
        }),
      );
    });

    it("logs responses with duration", async () => {
      expect.assertions(3);
      const expectedResponse = [generateMockEndUser()];
      mockAdapter.onGet("/end_users").reply(200, expectedResponse);

      const durationMs = 10;
      jest
        .spyOn(Date, "now")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(durationMs);
      jest.spyOn(console, "log").mockImplementation();
      const response = await client.endUsers.list();

      expect(response).toStrictEqual(expectedResponse);
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(
        "Conductor response:",
        stringifyForLogs({
          duration: `${durationMs / 1000}s`,
          status: 200,
          data: expectedResponse,
          request: {
            endpoint: "GET /end_users",
          },
        }),
      );
    });

    it("logs errors", async () => {
      expect.assertions(3);
      mockAdapter.onGet("/end_users").networkError();

      jest.spyOn(console, "log").mockImplementation();
      const conductorError = await client.endUsers
        .list()
        .catch((error: ConductorError) => error);
      expect(conductorError).toBeInstanceOf(ConductorError);
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(
        stringifyForLogs(conductorError),
      );
    });
  });

  describe("`verbose` is `false`", () => {
    const client = new Client("mock-api-key", {
      verbose: false,
    });
    // @ts-expect-error -- Accessing a private property for testing.
    const mockAdapter = new MockAdapter(client.httpClient);

    it("does not log requests or responses", async () => {
      expect.assertions(2);
      const expectedResponse = [generateMockEndUser()];
      mockAdapter.onGet("/end_users").reply(200, expectedResponse);

      jest.spyOn(console, "log").mockImplementation();
      const response = await client.endUsers.list();

      expect(response).toStrictEqual(expectedResponse);
      expect(console.log).not.toHaveBeenCalled();
    });

    it("does not log errors", async () => {
      expect.assertions(2);
      mockAdapter.onGet("/end_users").networkError();

      jest.spyOn(console, "log").mockImplementation();
      await expect(client.endUsers.list()).rejects.toBeInstanceOf(
        ConductorError,
      );
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});

describe("createRequestLogObject", () => {
  it("returns an object with `endpoint` as `method` and `url`", () => {
    const config: AxiosRequestConfig = {
      method: "GET",
      url: "http://example.com",
      data: { key: "value" },
    };
    const result = createRequestLogObject(config);
    expect(result).toStrictEqual({
      endpoint: "GET http://example.com",
      body: { key: "value" },
    });
  });

  it("returns an object with `endpoint` as only `method` when `url` is missing", () => {
    const config: AxiosRequestConfig = {
      method: "POST",
      data: { key: "value" },
    };
    const result = createRequestLogObject(config);
    expect(result).toStrictEqual({
      endpoint: "POST",
      body: { key: "value" },
    });
  });

  it("returns an object with `endpoint` as only `endpoint` when `method` is missing", () => {
    const config: AxiosRequestConfig = {
      url: "http://example.com",
      data: { key: "value" },
    };
    const result = createRequestLogObject(config);
    expect(result).toStrictEqual({
      endpoint: "http://example.com",
      body: { key: "value" },
    });
  });

  it("returns an object without `endpoint` when both `method` and `url` are missing", () => {
    const config: AxiosRequestConfig = {
      data: { key: "value" },
    };
    const result = createRequestLogObject(config);
    expect(result).toStrictEqual({
      body: { key: "value" },
    });
  });

  it("returns an object without `body` when `data` is missing", () => {
    const config: AxiosRequestConfig = {
      method: "GET",
      url: "http://example.com",
    };
    const result = createRequestLogObject(config);
    expect(result).toStrictEqual({
      endpoint: "GET http://example.com",
    });
  });
});

describe("getDurationStringFromConfig", () => {
  it("returns the duration in seconds as a string", () => {
    const durationMs = 10 * 1000;
    const requestConfig = {
      startTime: Date.now() - durationMs,
    } as RequestConfigWithStartTime;
    const durationString = getDurationStringFromConfig(requestConfig);
    expect(durationString).toBe("10s");
  });

  it("rounds the duration to two decimal places", () => {
    const durationMs = 10.1234 * 1000;
    const requestConfig = {
      startTime: Date.now() - durationMs,
    } as RequestConfigWithStartTime;
    const durationString = getDurationStringFromConfig(requestConfig);
    expect(durationString).toBe("10.12s");
  });
});

describe("stringifyForLogs", () => {
  it("uses Node.js's native `util.inspect` to stringify the provided object", () => {
    jest.spyOn(util, "inspect");
    const obj = { name: "John", age: 30 };
    stringifyForLogs(obj);
    expect(util.inspect).toHaveBeenCalledWith(obj, { depth: 5, colors: false });
    expect(util.inspect).toHaveBeenCalledTimes(1);
  });
});
