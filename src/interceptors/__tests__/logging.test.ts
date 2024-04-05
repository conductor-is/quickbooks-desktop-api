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
      // Only check the request log, not the response log.
      expect(console.log).toHaveBeenNthCalledWith(
        1,
        "Conductor request:",
        stringifyForLogs({
          method: "GET",
          url: "http://localhost:4000/v1/end_users",
          headers: { Authorization: "BEARER sk_live_************" },
        }),
      );
    });

    it("logs POST requests with the input bodies", async () => {
      expect.assertions(2);
      const endUser = generateMockEndUser();
      const endUserInput = generateMockEndUserCreateInput({
        sourceId: endUser.sourceId,
        email: endUser.email,
        companyName: endUser.companyName,
      });
      mockAdapter.onPost("/end_users").reply(200, endUser);

      jest.spyOn(console, "log").mockImplementation();
      await client.endUsers.create(endUserInput);

      expect(console.log).toHaveBeenCalledTimes(2);
      // Only check the request log, not the response log.
      expect(console.log).toHaveBeenNthCalledWith(
        1,
        "Conductor request:",
        stringifyForLogs({
          method: "POST",
          url: "http://localhost:4000/v1/end_users",
          body: endUserInput,
          headers: { Authorization: "BEARER sk_live_************" },
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
      // Only check the response log, not the request log.
      expect(console.log).toHaveBeenNthCalledWith(
        2,
        "Conductor response:",
        stringifyForLogs({
          duration: `${durationMs / 1000}s`,
          status: 200,
          data: expectedResponse,
          request: {
            method: "GET",
            url: "http://localhost:4000/v1/end_users",
            headers: { Authorization: "BEARER sk_live_************" },
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
        .catch((error: unknown) => error);
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
  it("handles an empty config", () => {
    const config: AxiosRequestConfig = {};
    expect(createRequestLogObject(config)).toStrictEqual({});
  });

  it("handles a config with `method`", () => {
    const config: AxiosRequestConfig = {
      method: "get",
    };
    expect(createRequestLogObject(config)).toStrictEqual({
      method: "GET",
    });
  });

  it("handles a config with `baseUrl` and `url`", () => {
    const config: AxiosRequestConfig = {
      baseURL: "https://api.example.com",
      url: "/end_users",
    };
    expect(createRequestLogObject(config)).toStrictEqual({
      url: "https://api.example.com/end_users",
    });
  });

  it("handles a config with `url` and no `baseUrl`", () => {
    const config: AxiosRequestConfig = {
      url: "/end_users",
    };
    expect(createRequestLogObject(config)).toStrictEqual({
      url: "/end_users",
    });
  });

  it("handles a config with `baseUrl` and no `url`", () => {
    const config: AxiosRequestConfig = {
      baseURL: "https://api.example.com",
    };
    expect(createRequestLogObject(config)).toStrictEqual({
      url: "https://api.example.com",
    });
  });

  it("handles a config with `data`", () => {
    const config: AxiosRequestConfig = {
      data: {
        name: "John",
        age: 30,
      },
    };
    expect(createRequestLogObject(config)).toStrictEqual({
      body: {
        name: "John",
        age: 30,
      },
    });
  });

  it("handles a config with `headers`", () => {
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sk_live_12345",
      },
    };
    expect(createRequestLogObject(config)).toStrictEqual({
      headers: {
        "Content-Type": "application/json",
        Authorization: "BEARER sk_live_************",
      },
    });
  });

  it("handles a full config", () => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: "https://api.example.com",
      url: "/end_users",
      data: {
        name: "John",
        age: 30,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sk_live_12345",
      },
    };
    expect(createRequestLogObject(config)).toStrictEqual({
      method: "POST",
      url: "https://api.example.com/end_users",
      body: {
        name: "John",
        age: 30,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: "BEARER sk_live_************",
      },
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
