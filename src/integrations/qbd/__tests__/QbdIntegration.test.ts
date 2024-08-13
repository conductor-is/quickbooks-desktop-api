import Client from "@conductor/client-node/Client";
import { ConductorIntegrationError } from "@conductor/client-node/utils/error";
import { expectToRejectWithConductorError } from "@conductor/client-node/utils/test/misc";

const CATEGORIES_REQUIRING_QUERY_PARAMS = new Set([
  "txnDeleted",
  "listDeleted",
]);

const CATEGORIES_WITHOUT_QUERY = new Set(["dataExt"]);

describe("QbdIntegration", () => {
  describe("invokes `sendRequest` with the correct arguments", () => {
    const qbdIntegration = new Client("mock-api-key").qbd;
    const endUserId = "end_user_mock-id";
    const expectedResponse = { Baz: "Qux" };

    type MethodCategory = Record<
      string,
      (endUserId: string, params: Record<string, unknown>) => Promise<object>
    >;
    const methodCategories = Object.entries(qbdIntegration).filter(
      ([key]) =>
        key !== "httpClient" &&
        // We handle the `report` category separately below.
        key !== "report",
    ) as [string, MethodCategory][];

    describe.each(methodCategories)("%s", (categoryName, methodCategory) => {
      const categoryNameTitleCase =
        categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      // Skip `transaction.delete()` and `transaction.void(), which have a
      // unique input and output structure.
      const methods = Object.entries(methodCategory).filter(
        ([methodName]) => methodName !== "delete" && methodName !== "void",
      );

      it.each(methods)("%s", async (methodName, method) => {
        expect.assertions(3);
        const methodNameTitleCase =
          methodName.charAt(0).toUpperCase() + methodName.slice(1);
        const sendRequestSpy = jest
          // @ts-expect-error -- Accessing a private property for testing.
          .spyOn(qbdIntegration, "sendRequest")
          // @ts-expect-error -- Accessing a private property for testing.
          .mockResolvedValue({
            [`${categoryNameTitleCase}${methodNameTitleCase}Rs`]: {
              [`${categoryNameTitleCase}Ret`]: expectedResponse,
            },
          });

        let params: Record<string, unknown> = { Foo: "Bar" };
        const response = await method(endUserId, params);

        // eslint-disable-next-line jest/no-conditional-in-test -- Unavoidable.
        if (methodName === "add" || methodName === "mod") {
          // The parameters for `add` and `mod` requests are nested an
          // additional layer.
          params = {
            [`${categoryNameTitleCase}${methodNameTitleCase}`]: params,
          };
        }

        expect(sendRequestSpy).toHaveBeenCalledTimes(1);
        expect(sendRequestSpy).toHaveBeenCalledWith(
          endUserId,
          "quickbooks_desktop",
          { [`${categoryNameTitleCase}${methodNameTitleCase}Rq`]: params },
        );
        expect(response).toStrictEqual(expectedResponse);
      });

      if (
        !CATEGORIES_REQUIRING_QUERY_PARAMS.has(categoryName) &&
        !CATEGORIES_WITHOUT_QUERY.has(categoryName)
      ) {
        it("query without `params`", async () => {
          expect.assertions(3);
          const methodNameTitleCase = "Query";
          const sendRequestSpy = jest
            // @ts-expect-error -- Accessing a private property for testing.
            .spyOn(qbdIntegration, "sendRequest")
            // @ts-expect-error -- Accessing a private property for testing.
            .mockResolvedValue({
              [`${categoryNameTitleCase}${methodNameTitleCase}Rs`]: {
                [`${categoryNameTitleCase}Ret`]: expectedResponse,
              },
            });

          const queryWithoutParams = methodCategory["query"] as (
            endUserId: string,
          ) => Promise<object>;
          const response = await queryWithoutParams(endUserId);

          expect(sendRequestSpy).toHaveBeenCalledTimes(1);
          expect(sendRequestSpy).toHaveBeenCalledWith(
            endUserId,
            "quickbooks_desktop",
            { [`${categoryNameTitleCase}${methodNameTitleCase}Rq`]: {} },
          );
          expect(response).toStrictEqual(expectedResponse);
        });
      }
    });

    describe("report", () => {
      it.each(Object.entries(qbdIntegration.report))(
        "%s",
        async (methodName, method) => {
          expect.assertions(3);
          const methodNameTitleCase =
            methodName.charAt(0).toUpperCase() + methodName.slice(1);
          const sendRequestSpy = jest
            // @ts-expect-error -- Accessing a private property for testing.
            .spyOn(qbdIntegration, "sendRequest")
            // @ts-expect-error -- Accessing a private property for testing.
            .mockResolvedValue({
              [`${methodNameTitleCase}ReportQueryRs`]: {
                ReportRet: expectedResponse,
              },
            });

          const params = { Foo: "Bar" };
          // @ts-expect-error -- Mocking parameters that are different for each method.
          const response = await method(endUserId, params);

          expect(sendRequestSpy).toHaveBeenCalledTimes(1);
          expect(sendRequestSpy).toHaveBeenCalledWith(
            endUserId,
            "quickbooks_desktop",
            { [`${methodNameTitleCase}ReportQueryRq`]: params },
          );
          expect(response).toStrictEqual(expectedResponse);
        },
      );
    });
  });

  describe("sendRequestWrapper", () => {
    const qbdIntegration = new Client("mock-api-key").qbd;

    const endUserId = "end_user_mock-id";
    const params = { Foo: "Bar" };
    const responseWrapperKey = "FooModRs";
    const responseBodyKey = "FooRet";
    const expectedResponse = { Baz: "Qux" };

    it("forwards the request to `sendRequest` and returns the response body", async () => {
      expect.assertions(3);
      const sendRequestSpy = jest
        // @ts-expect-error -- Accessing a private property for testing.
        .spyOn(qbdIntegration, "sendRequest")
        // @ts-expect-error -- Accessing a private property for testing.
        .mockResolvedValue({
          [responseWrapperKey]: {
            [responseBodyKey]: expectedResponse,
          },
        });

      // @ts-expect-error -- Accessing a private property for testing.
      const response = await qbdIntegration.sendRequestWrapper(
        endUserId,
        params,
        responseWrapperKey,
        responseBodyKey,
      );

      expect(sendRequestSpy).toHaveBeenCalledTimes(1);
      expect(sendRequestSpy).toHaveBeenCalledWith(
        endUserId,
        "quickbooks_desktop",
        params,
      );
      expect(response).toStrictEqual(expectedResponse);
    });

    it("throws an error if there is no response", async () => {
      expect.assertions(2);
      jest
        // @ts-expect-error -- Accessing a private property for testing.
        .spyOn(qbdIntegration, "sendRequest")
        // @ts-expect-error -- Accessing a private property for testing.
        .mockResolvedValue({});

      await expectToRejectWithConductorError(
        // @ts-expect-error -- Accessing a private property for testing.
        qbdIntegration.sendRequestWrapper(
          endUserId,
          params,
          responseWrapperKey,
          responseBodyKey,
        ),
        new ConductorIntegrationError({
          message: "No response received from QuickBooks Desktop.",
          userFacingMessage: "No response received from QuickBooks Desktop.",
          code: "QBD_NO_RESPONSE",
        }),
      );
    });
  });
});
