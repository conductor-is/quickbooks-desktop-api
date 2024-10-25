import BaseIntegration from "@conductor/client-node/integrations/BaseIntegration";
import type * as QbdTypes from "@conductor/client-node/integrations/qbd/qbdTypes";
import { ConductorIntegrationError } from "@conductor/client-node/utils/error";

export default class QbdIntegration extends BaseIntegration {
  /**
   * An account represents a financial account, allowing customization like
   * sub-accounting, account numbering, and initial balance setting.
   */
  public account = {
    /**
     * Perform the same activities as a user does in the QB New Account form,
     * which can be accessed in QB by selecting "Lists" → "Chart of Accounts" →
     * "Accounts" → "New".
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/AccountAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.AccountAddRq["AccountAdd"],
    ): Promise<NonNullable<QbdTypes.AccountAddRs["AccountRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { AccountAddRq: { AccountAdd: params } },
        "AccountAddRs",
        "AccountRet",
      ),

    /**
     * Modifies an account.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/AccountMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.AccountModRq["AccountMod"],
    ): Promise<NonNullable<QbdTypes.AccountModRs["AccountRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { AccountModRq: { AccountMod: params } },
        "AccountModRs",
        "AccountRet",
      ),

    /**
     * `AccountQuery` is a list query that returns data for all accounts that
     * match the provided filter criteria. Notice that it returns only data
     * internal to the account itself. It does not return any data about
     * transactions involving the account. It does, however, return the parent
     * account, if there is one. You can search across all accounts or you can
     * specify an account type and search only those.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/AccountQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.AccountQueryRq = {},
    ): Promise<NonNullable<QbdTypes.AccountQueryRs["AccountRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { AccountQueryRq: params },
        "AccountQueryRs",
        "AccountRet",
      ),
  };

  /**
   * A credit card refund transaction is a transaction that represents a
   * refund of a credit card charge.
   */
  public arRefundCreditCard = {
    /**
     * Adds a credit card refund transaction that is linked to one or more
     * QuickBooks credit memo transactions. You can link the credit card refund
     * to one or more of those credit transactions.
     *
     * Notice that this provides functionality over and above what the UI
     * provides, which currently allows a user to link only one credit card
     * refund to one credit transaction.
     *
     * See more:
     * https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ARRefundCreditCardAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ARRefundCreditCardAddRq["ARRefundCreditCardAdd"],
    ): Promise<
      NonNullable<QbdTypes.ARRefundCreditCardAddRs["ARRefundCreditCardRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ARRefundCreditCardAddRq: { ARRefundCreditCardAdd: params } },
        "ARRefundCreditCardAddRs",
        "ARRefundCreditCardRet",
      ),

    /**
     * Retrieves the specified credit card refund transaction or transactions.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ARRefundCreditCardQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ARRefundCreditCardQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.ARRefundCreditCardQueryRs["ARRefundCreditCardRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ARRefundCreditCardQueryRq: params },
        "ARRefundCreditCardQueryRs",
        "ARRefundCreditCardRet",
      ),
  };

  /**
   * A bill is a transaction that represents a request-for-payment from a vendor
   * for goods or services that it has provided.
   */
  public bill = {
    /**
     * This API provides the functionality of the QuickBooks “Enter Bills” form,
     * which is used when the QuickBooks user owes money to a vendor, either
     * through expenses incurred by the vendor (specified in the Expenses tab
     * within the Enter Bills form), or through receiving items (specified in
     * the Items tab within the Enter Bills form). When a bill is added,
     * QuickBooks enters the billed amount into the `AccountsPayable` register.
     *
     * The Enter Bills form can be reached in the QuickBooks UI by selecting
     * "Vendors" -> "Enter Bills", or by clicking on the Bill icon on the main
     * menubar. Notice that the `ExpenseLineAdd` aggregate maps to a line item
     * inside the Expense tab in the Enter Bills form, and the `ItemLineAdd`
     * aggregate maps to a line item inside the Item tab.
     *
     * If you are receiving items against one or more open `PurchaseOrders` for
     * the vendor, you can use the `LinkToTxnID` element (links in all line
     * items from a `PurchaseOrder`) and/or the `LinkToTxn` aggregate within a
     * line item (links in a specific `PurchaseOrder` line item).
     * - See the chapter on handling receive payment and bill payment in the QB
     *   SDK Programmer’s Guide for complete details and rules: "The Life Cycle
     *   of Inventory Items and Effects of Sales and Purchases".
     *
     * The value of inventory is set when an inventory item is created or
     * bought. QuickBooks uses cost averaging and decreases the value of the
     * inventory asset account at the price when the sale is recorded.
     *
     * So, lets say a company starts carrying widgets as inventory items. First
     * the inventory item must be created in QuickBooks. If the widgets are
     * already in inventory based on a purchase made that will not be recorded
     * in QuickBooks, the user or application would add the inventory item
     * description along with the quantity on hand and the value (total purchase
     * price) of the quantity on hand. If the purchase is to be recorded in
     * QuickBooks the inventory item would be created with quantity and value of
     * 0 (zero). Then a bill would be added to QB which would increase the
     * inventory quantity and value. Lets say we bought 10 widgets for $100.
     * QuickBooks would then consider each widget to be worth $10. The next day
     * a customer buys 5 widgets for $20 each. A sales receipt or invoice is
     * created for the purchase, the quantity of widgets is reduced by 5, to 5
     * and the value is reduced by $50 to $50. The inventory asset account is
     * reduced by $50 and the undeposited funds or accounts receivable account
     * is increased by $100. It appears that widgets will be a big seller, so
     * the small business owner goes out and buys 10 more widgets. However, the
     * supplier has also noticed a widget buying trend, so he’s increased the
     * price to $25 each. So now our quantity is increased from 5 to 15 and the
     * value is increased from $50 to $300, so they are considered to be worth
     * $20 each. After purchasing the widgets another customer decides to buy 10
     * widgets but the price has been raised to $50 each. After the sales
     * receipt or invoice is entered, the inventory is reduced to 5 and the
     * value
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BillAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.BillAddRq["BillAdd"],
    ): Promise<NonNullable<QbdTypes.BillAddRs["BillRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { BillAddRq: { BillAdd: params } },
        "BillAddRs",
        "BillRet",
      ),

    /**
     * Edit an existing Bill, similar to editing a Bill in the Enter Bills form
     * in the QuickBooks UI.
     *
     * Notice that you cannot link a `PurchaseOrder` to an existing Bill using
     * the `BillMod` request. You can link to a `PurchaseOrder` only in new
     * Bills, using `BillAdd`.
     *
     * Notice also that some fields in a `BillMod` request cannot be cleared. If
     * any of the following fields is included in a bill modify request, it must
     * contain a value:
     * - `VendorRef`
     * - `APAccountRef`
     * - `TxnDate`
     * - `DueDate`
     * - `ClearExpenseLines`
     * - `ClearItemLines`
     *
     * Within` ExpenseLineMod`:
     * - `Amount`
     * - `BillableStatus`
     *
     * Within `ItemLineMod` or `ItemGroupMod`:
     * - `ItemRef`
     * - `Quantity`
     * - `Cost`
     * - `Amount`
     * - `BillableStatus`
     * - `OverrideItemAccountRef`
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BillMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.BillModRq["BillMod"],
    ): Promise<NonNullable<QbdTypes.BillModRs["BillRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { BillModRq: { BillMod: params } },
        "BillModRs",
        "BillRet",
      ),

    /**
     * Provides functionality found in the Find/Advanced-Find window to find
     * bills that are to be paid by check. The Find/Advanced-Find windows can be
     * reached by clicking the Find button on the main QuickBooks menubar, by
     * selecting "Edit" -> "Find", or simply by using the shortcut CTRL-F. Notice that
     * you can use the `metaData` attribute inside the query tag if you want
     * only a count of the bills that will be returned from the query. If you
     * know the bill’s transaction ID or reference number, you could use these,
     * or search by transaction date, or search by the date where the bill was
     * last modified. You can search for paid/unpaid bills by using the
     * `PaidStatus` flag.
     *
     * If you need additional filters, you can use the entity filter to search
     * for bills from a specific vendor or vendor sub (using the
     * `ListIDWithChildren` or `FullNameWithChildren` tags). You can also search
     * for bills entered against a particular account (the `APAccountRef`
     * specified in the originating `BillAdd` request). You can specify all
     * subaccounts by using the various `*WithChildren` tags. For example, to
     * find all bills entered against Checking where you have multiple checking
     * accounts, you would use the `ListIDWithChildren` or
     * `FullNameWithChildren` tags inside your AccountFilter tags. You can
     * filter on the `RefNumber` or `RefNumber` range. Notice that all of these
     * filters can be used together (ANDed) if desired.
     *
     * If you want bill line items returned from the query, you must use the
     * `IncludeLineItems` tag. Notice that you don’t specify line item groups.
     * If line item groups were set up for the line items, the returned line
     * items are automatically segregated by group.
     *
     * You can get all of the linked transactions such as `PurchaseOrders` and
     * Credits by using the `IncludeLinkedTxns` tag. You can get public data
     * extensions (these are custom data whose fields can be displayed in
     * QuickBooks) by supplying the OwnerID tag set to 0. To get private data
     * extensions (custom data not displayable in QuickBooks) you must use the
     * `OwnerID` tag set to the known GUID value. You must know the GUID value
     * in order to access private data extensions.
     *
     * To prevent the return of too much data, you can use `MaxReturned` to
     * limit the total number of bills returned from the query. In addition, you
     * can limit the type of data that is returned for each bill, using
     * `IncludeRetElement`. Finally, you can specify whether each bill contains
     * line items using the `IncludeLineItems`, which by default is False (no
     * line item data).
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BillQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.BillQueryRq = {},
    ): Promise<NonNullable<QbdTypes.BillQueryRs["BillRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { BillQueryRq: params },
        "BillQueryRs",
        "BillRet",
      ),
  };

  /**
   * A billing rate is a predefined cost rate assigned to vendors or employees.
   */
  public billingRate = {
    /**
     * Adds a billing rate to the billing rate level list.
     *
     * After a billing rate is created, it can be assigned to an employee or
     * vendor (`VendorAdd`/`VendorMod`, `EmployeeAdd`/`EmployeeMod`) via the
     * `BillingRateRef` element in the appropriate request. Then, once the
     * billing rate is assigned to an employee or vendor, if you use that
     * employee or vendor in a time transaction (`TimeTrackingAdd`), then the
     * billing rate will override the rate specified by the service item used in
     * the time transaction.
     *
     * Use `FixedBillingRate` to override all service items with a fixed rate.
     * Use `BillingRatePerItem` to override a specific service item. If you want
     * to specify more than one service item, you’ll need to use one
     * `BillingRatePerItem` aggregate for each service item.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BillingRateAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.BillingRateAddRq["BillingRateAdd"],
    ): Promise<NonNullable<QbdTypes.BillingRateAddRs["BillingRateRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { BillingRateAddRq: { BillingRateAdd: params } },
        "BillingRateAddRs",
        "BillingRateRet",
      ),

    /**
     * Returns all billing rates, or billing rates filtered by modified date, or
     * filtered by billing rate name, or filtered by the service item referenced
     * in the billing rate.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BillingRateQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.BillingRateQueryRq = {},
    ): Promise<NonNullable<QbdTypes.BillingRateQueryRs["BillingRateRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { BillingRateQueryRq: params },
        "BillingRateQueryRs",
        "BillingRateRet",
      ),
  };

  /**
   * A bill payment check is a transaction that represents a payment by check
   * for a bill.
   */
  public billPaymentCheck = {
    /**
     * Adds a bill payment check.
     *
     * A `BillPaymentCheckAdd` request must include either `PaymentAmount`,
     * `SetCredit`, or `DiscountAmount` (or more than one of these). If none of
     * these three is included, the SDK will return an error.
     *
     * Also, the `AppliedToTxnAdd` aggregate needs both the `TxnID` and the
     * payment amount if you are not using the `SetCredit` sub-aggregate or
     * QuickBooks won’t have an amount to apply. If you are using the
     * `SetCredit` sub-aggregate, you’ll need to set the amount in the
     * `AppliedAmount` field.
     *
     * `BillPaymentCheckAdd` provides the functionality found in the Pay Bills
     * form in the QuickBooks UI. You can reach this form by selecting
     * Retail->Pay Bills from the main QuickBooks menubar. `BillPayment` is
     * described in detail in the chapter on handling receive payment and bill
     * payment in the QB SDK Programmer’s Guide. Notice that the request
     * requires one (but not more than one!) `BillPaymentCheckAdd` sub
     * aggregate, which is provided to support the SDK macro feature in this
     * request. Notice that you can supply only one of these sub aggregates in
     * the request. If you want to pay multiple bills, you must issue a separate
     * request for each bill pay.
     *
     * If you are using more than one A/P account, make sure that the
     * `APAccountRef` in the `BillPaymentCheckAdd` matches the `APAccountRef`
     * that was used when the `Bill` was originally added. That is, the `Bill`
     * was entered in a particular account payable: use that same account
     * payable when you pay the bill using this request.
     *
     * Notice that although you can set the `IsToBePrinted` flag, you cannot
     * print checks using the SDK.
     *
     * Notice that you set the check number, if desired, using the `RefNumber`
     * tags.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BillPaymentCheckAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.BillPaymentCheckAddRq["BillPaymentCheckAdd"],
    ): Promise<
      NonNullable<QbdTypes.BillPaymentCheckAddRs["BillPaymentCheckRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { BillPaymentCheckAddRq: { BillPaymentCheckAdd: params } },
        "BillPaymentCheckAddRs",
        "BillPaymentCheckRet",
      ),

    /**
     * Modifies the specified bill payment check.
     *
     * Note: the `AppliedToTxnMod` aggregate needs both the `TxnID` and the
     * payment amount if you are not using the `SetCredit` sub-aggregate or
     * QuickBooks won’t have an amount to apply. If you are using the
     * `SetCredit` sub-aggregate, you’ll need to set the amount in the
     * `AppliedAmount` field.
     *
     * Generally, this is what you can do with `BillPaymentCheckMod`:
     * - Modify or clear the `RefNumber` or Memo.
     * - Modify (not clear) the `TxnDate`.
     * - Modify (not clear) the `BankAccountRef`
     * - Modify (not clear) the `IsToBePrinted` flag.
     * - For a bill payment check transaction that has been applied to several
     *   existing bills, redistribute the payment amounts applied to the bills.
     * - Change the discount amount applied to particular bill.
     * - You CANNOT change the credit amount applied to a particular bill. NOT
     *   SUPPORTED!
     * - Apply the payment amount to a different bill. Apply a discount, and a
     *   credit. The existing distribution is cleared, except for any credit
     *   that may have been applied.
     * - Use a `BillPaymentCheckMod` to simply apply an additional credit to a
     *   bill. Additional payment amount is available as a credit
     *
     * Other things you need to know: When a `BillPaymentCheckMod` request is
     * processed, if the `AppliedToTxnMod` aggregate is specified, then the
     * existing payments and discounts will be cleared (but not the credits).
     * The original payment amount will be redistributed according to the
     * `AppliedToTxnMod` aggregates (0 or more) contained in the
     * `BillPaymentCheckMod` request. The `AppliedToTxnMod` aggregate may
     * specify discounts, just as does the `AppliedToTxnAdd` aggregate. These
     * discounts will replace any original discounts. Credits may also be
     * specified. But if so, then the credits will be additional credits, and
     * will not affect any credits that were originally applied. The existing
     * payments and discounts will be cleared only if `AppliedToTxnMod` is
     * specified in the request. This will allow clients to modify other
     * information without modifying the distribution of the payment.
     *
     * In summary, in the `BillPaymentCheckMod` request, in the
     * `AppliedToTxnMod` aggregate, discounts replace those given in the
     * original payment. However credits simply add to any credits that may have
     * been applied before.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BillPaymentCheckMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.BillPaymentCheckModRq["BillPaymentCheckMod"],
    ): Promise<
      NonNullable<QbdTypes.BillPaymentCheckModRs["BillPaymentCheckRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { BillPaymentCheckModRq: { BillPaymentCheckMod: params } },
        "BillPaymentCheckModRs",
        "BillPaymentCheckRet",
      ),

    /**
     * Returns bill payment check transactions based on the supplied query
     * criteria.
     *
     * Provides functionality found in the Find/Advanced-Find window to find
     * bill payments paid by check. The Find/Advanced-Find windows can be
     * reached by clicking the Find button on the main QuickBooks menubar, by
     * selecting "Edit" -> "Find", or simply by using the shortcut CTRL-F. Notice that
     * you can use the `metaData` attribute inside the query tag if you want
     * only a count of the bill payments that will be returned from the query.
     *
     * If you know the bill payment transaction ID or reference number, you
     * could use these, or search by transaction date, or search by the date
     * where the bill was last modified.
     *
     * If you need additional filters, you can use the entity filter to search
     * for bills from a specific vendor or vendor sub (using the
     * `ListIDWithChildren` or `FullNameWithChildren` tags). You can also search
     * for bills entered against a particular account (the `APAccountRef`
     * specified in the originating `BillAdd` request). You can specify all
     * subaccounts by using the various `*WithChildren` tags. For example, to
     * find all bills entered against Checking where you have multiple checking
     * accounts, you would use the `ListIDWithChildren` or
     * `FullNameWithChildren` tags inside your `AccountFilter` tags. Finally,
     * you can filter on the `RefNumber` or `RefNumber` range. Notice that all
     * of these filters can be used together (ANDed) if desired.
     *
     * To prevent the return of too much data, you can use `MaxReturned` to
     * limit the total number of bills returned from the query. In addition, you
     * can limit the type of data that is returned for each bill, using
     * `IncludeRetElement`. Finally, you can specify whether each bill contains
     * line items using the `IncludeLineItems`, which by default is `False` (no
     * line item data).
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BillPaymentCheckQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.BillPaymentCheckQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.BillPaymentCheckQueryRs["BillPaymentCheckRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { BillPaymentCheckQueryRq: params },
        "BillPaymentCheckQueryRs",
        "BillPaymentCheckRet",
      ),
  };

  /**
   * A bill payment credit card is a transaction that represents a payment by
   * credit card for a bill.
   */
  public billPaymentCreditCard = {
    /**
     * Adds a bill payment credit card.
     *
     * A `BillPaymentCreditCardAdd` request must include either `PaymentAmount`,
     * `SetCredit`, or `DiscountAmount` (or more than one of these). If none of
     * these three is included, the SDK will return an error.
     *
     * `BillPaymentCreditCardAdd` provides functionality found in the Pay Bills
     * form in the QuickBooks UI. You can reach this form by selecting "Retail"
     * -> "Pay Bills" from the main QuickBooks menubar. `BillPayment` is
     * described in detail in the chapter on handling receive payment and bill
     * payment in the QB SDK Programmer’s Guide. Notice that the request
     * requires one (but not more than one!) `BillPaymentCreditCardAdd`
     * sub-aggregate. Notice that you can supply only one of these
     * sub-aggregates in the request. If you want to pay multiple bills, you
     * must issue a separate request for each bill pay.
     *
     * If you are using more than one A/P account, make sure that the
     * `APAccountRef` in the `BillPaymentCreditCardAdd` matches the
     * `APAccountRef` that was used when the `Bill` was originally added. That
     * is, the `Bill` was entered in a particular account payable: use that same
     * account payable when you pay the bill using this request.
     *
     * Notice that although you can set the `IsToBePrinted` flag, you cannot
     * print checks using the SDK.
     *
     * Finally, notice that it is possible to issue this request using only
     * `SetCredit` to apply an existing credit to the bill. However, if you do
     * this, you should be aware that no transaction ID is generated. The credit
     * and the bill simply are linked.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BillPaymentCreditCardAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.BillPaymentCreditCardAddRq["BillPaymentCreditCardAdd"],
    ): Promise<
      NonNullable<
        QbdTypes.BillPaymentCreditCardAddRs["BillPaymentCreditCardRet"]
      >
    > =>
      this.sendRequestWrapper(
        endUserId,
        { BillPaymentCreditCardAddRq: { BillPaymentCreditCardAdd: params } },
        "BillPaymentCreditCardAddRs",
        "BillPaymentCreditCardRet",
      ),

    /**
     * Returns bill payment credit card transactions based on the supplied query
     * criteria.
     *
     * Provides functionality found in the Find/Advanced Find window to find
     * bill payments that were paid by credit card. The Find/Advanced Find
     * windows can be reached by clicking the Find button on the main QuickBooks
     * menubar, by selecting "Edit" -> "Find", or simply by using the shortcut
     * CTRL-F. Notice that you can use the metaData attribute inside the query
     * tag if you want only a count of the bill payments that will be returned
     * from the query.
     *
     * If you know the bill’s transaction ID or reference number, you could use
     * these, or search by transaction date, or search by the date where the
     * bill was last modified.
     *
     * Important: If you made a bill payment by credit card, and ONLY applied a
     * credit using `SetCredit` (no funds were applied other than the credit),
     * then that payment will not be returned in this query because it is not
     * considered a separate transaction and has no `TxnID`. To get that kind of
     * payment, you must do a `BillQuery` on the original bill and specify
     * `IncludeLinkedTxns`. Any applied credit will be linked directly to the
     * bill.
     *
     * If you need additional filters, you can use the entity filter to search
     * for bills from a specific vendor or vendor sub (using the
     * `ListIDWithChildren` or `FullNameWithChildren` tags). You can also search
     * for bills entered against a particular account (the `APAccountRef`
     * specified in the originating `BillAdd` request). You can specify all
     * subaccounts by using the various *WithChildren tags. For example, to find
     * all bills entered against Checking where you have multiple checking
     * accounts, you would use the `ListIDWithChildren` or
     * `FullNameWithChildren` tags inside your AccountFilter tags. Finally, you
     * can filter on the `RefNumber` or `RefNumber` range. Notice that all of
     * these filters can be used together (ANDed) if desired.
     *
     * To prevent the return of too much data, you can use `MaxReturned` to
     * limit the total number of bills returned from the query. In addition, you
     * can limit the type of data that is returned for each bill, using
     * `IncludeRetElement`.
     *
     * Finally, you can specify whether each bill contains line items using the
     * `IncludeLineItems`, which by default is `False` (no line item data).
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BillPaymentCreditCardQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.BillPaymentCreditCardQueryRq = {},
    ): Promise<
      NonNullable<
        QbdTypes.BillPaymentCreditCardQueryRs["BillPaymentCreditCardRet"]
      >
    > =>
      this.sendRequestWrapper(
        endUserId,
        { BillPaymentCreditCardQueryRq: params },
        "BillPaymentCreditCardQueryRs",
        "BillPaymentCreditCardRet",
      ),
  };

  /**
   * A build assembly represents an inventory item created from other inventory
   * items or assemblies.
   */
  public buildAssembly = {
    /**
     * Adds a build assembly transaction to QuickBooks, where the specified
     * quantity of the specified inventory assembly item is built. If there are
     * insufficient quantities of items required for the build, you can have the
     * build marked as a pending build by using setting `MarkPendingIfRequired`
     * to `True`. (If you don’t and there aren’t enough quantities on hand for
     * the build, this request will fail.) If successful, this request results
     * in the decrementing of the quantities on hand amounts of each item used
     * in the build, and the incrementing of the on hand quantities of the built
     * assembly item.
     *
     * This request is supported only in Premier and Enterprise.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BuildAssemblyAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.BuildAssemblyAddRq["BuildAssemblyAdd"],
    ): Promise<NonNullable<QbdTypes.BuildAssemblyAddRs["BuildAssemblyRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { BuildAssemblyAddRq: { BuildAssemblyAdd: params } },
        "BuildAssemblyAddRs",
        "BuildAssemblyRet",
      ),

    /**
     * Modifies an existing build assembly transaction in the QuickBooks
     * company.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BuildAssemblyMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.BuildAssemblyModRq["BuildAssemblyMod"],
    ): Promise<NonNullable<QbdTypes.BuildAssemblyModRs["BuildAssemblyRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { BuildAssemblyModRq: { BuildAssemblyMod: params } },
        "BuildAssemblyModRs",
        "BuildAssemblyRet",
      ),

    /**
     * Filters build assembly transactions by the specified filter criteria.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BuildAssemblyQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.BuildAssemblyQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.BuildAssemblyQueryRs["BuildAssemblyRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { BuildAssemblyQueryRq: params },
        "BuildAssemblyQueryRs",
        "BuildAssemblyRet",
      ),
  };

  /**
   * A charge contains information about a statement charge. (A credit card
   * charge, on the other hand, refers to a credit card charge incurred by the
   * QuickBooks user.)
   */
  public charge = {
    /**
     * Adds a customer charge. A `Charge` contains information about a statement
     * charge. (A `CreditCardCharge` object, on the other hand, refers to a
     * credit card charge incurred by the QuickBooks user.)
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ChargeAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ChargeAddRq["ChargeAdd"],
    ): Promise<NonNullable<QbdTypes.ChargeAddRs["ChargeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ChargeAddRq: { ChargeAdd: params } },
        "ChargeAddRs",
        "ChargeRet",
      ),

    /**
     * Modifies the specified charge.
     *
     * Some fields in a `ChargeMod` request cannot be cleared. If any of the
     * following fields is included in a charge modify request, it must contain
     * a value:
     * - `CustomerRef`
     * - `TxnDate`
     * - `ItemRef`
     * - `Quantity`
     * - `Rate`
     * - `Amount`
     * - `ARAccountRef`
     * - `OverrideItemAccountRef`
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ChargeMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ChargeModRq["ChargeMod"],
    ): Promise<NonNullable<QbdTypes.ChargeModRs["ChargeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ChargeModRq: { ChargeMod: params } },
        "ChargeModRs",
        "ChargeRet",
      ),

    /**
     * Returns information about statement charges.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ChargeQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ChargeQueryRq = {},
    ): Promise<NonNullable<QbdTypes.ChargeQueryRs["ChargeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ChargeQueryRq: params },
        "ChargeQueryRs",
        "ChargeRet",
      ),
  };

  /**
   * A check is a transaction that represents a paper check.
   */
  public check = {
    /**
     * The amount of a check is the total of the amounts assigned to expense
     * lines and item lines. You can write a check for:
     * - Any expense that you track through expense accounts.
     * - The following types of items: fixed asset, non-inventory part, service,
     *   and other charge.
     * - Putting money into your petty cash account.
     * - Inventory part items (if you use the inventory/purchase order feature).
     *
     * You cannot use a `CheckAdd` for any of the following:
     * - Paying a bill by check; instead, use a `BillPaymentCheckAdd`.
     * - Paying employees or create paychecks.
     * - Paying payroll taxes and liabilities.
     * - Paying sales tax.
     * - Paying for received items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CheckAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.CheckAddRq["CheckAdd"],
    ): Promise<NonNullable<QbdTypes.CheckAddRs["CheckRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CheckAddRq: { CheckAdd: params } },
        "CheckAddRs",
        "CheckRet",
      ),

    /**
     * Modifies an existing Check. Notice that you cannot use this to modify
     * `BillPaymentChecks`.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CheckMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.CheckModRq["CheckMod"],
    ): Promise<NonNullable<QbdTypes.CheckModRs["CheckRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CheckModRq: { CheckMod: params } },
        "CheckModRs",
        "CheckRet",
      ),

    /**
     * Returns certain types of checks based on the supplied query criteria.
     * Note that `BillPaymentChecks`, payroll checks, and liability checks are
     * not returned.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CheckQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.CheckQueryRq = {},
    ): Promise<NonNullable<QbdTypes.CheckQueryRs["CheckRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CheckQueryRq: params },
        "CheckQueryRs",
        "CheckRet",
      ),
  };

  /**
   * Classes can be used to separate transactions into meaningful categories.
   * (For example, transactions could be classified according to department,
   * business location, or type of work.)
   */
  public class = {
    /**
     * Classes can be used to separate transactions into meaningful categories.
     * (For example, transactions could be classified according to department,
     * business location, or type of work.) In QuickBooks, class tracking is off
     * by default.
     *
     * A `ClassRef` aggregate refers to one of these named classes. For example,
     * in a `TimeTracking` message, `ClassRef` refers to the QuickBooks class
     * into which the timed activity falls. If a `ClassRef` aggregate includes
     * both `FullName` and `ListID`, `FullName` will be ignored.
     *
     * In an `InvoiceAdd` request, if you specify a `ClassRef` for the whole
     * invoice, that same `ClassRef` is automatically used in the line items. If
     * you want to clear that (that is, have NO `ClassRef` for the line item,
     * you can clear it in the line item by simply not specifying it in the line
     * item.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ClassAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ClassAddRq["ClassAdd"],
    ): Promise<NonNullable<QbdTypes.ClassAddRs["ClassRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ClassAddRq: { ClassAdd: params } },
        "ClassAddRs",
        "ClassRet",
      ),

    /**
     * Modifies the specified class.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ClassMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ClassModRq["ClassMod"],
    ): Promise<NonNullable<QbdTypes.ClassModRs["ClassRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ClassModRq: { ClassMod: params } },
        "ClassModRs",
        "ClassRet",
      ),

    /**
     * Queries for existing classes.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ClassQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ClassQueryRq = {},
    ): Promise<NonNullable<QbdTypes.ClassQueryRs["ClassRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ClassQueryRq: params },
        "ClassQueryRs",
        "ClassRet",
      ),
  };

  /**
   * The company refers to the end-user's business entity within QuickBooks
   * Desktop.
   */
  public company = {
    /**
     * Returns detailed information about a QuickBooks company file, such as the
     * company’s address and legal name, certain preferences that are set, and
     * any services that the company is subscribed to, such as payroll,
     * QuickBooks Merchant Services, and so forth.
     *
     * Company information cannot be added or modified through the SDK, only
     * through the QuickBooks user interface
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CompanyQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.CompanyQueryRq = {},
    ): Promise<NonNullable<QbdTypes.CompanyQueryRs["CompanyRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CompanyQueryRq: params },
        "CompanyQueryRs",
        "CompanyRet",
      ),
  };

  /**
   * A credit card charge is a general charge incurred when a QuickBooks user
   * makes a purchase using a credit card. Credit card charges for purchases can
   * be tracked as expenses (in expense accounts) or as items.
   */
  public creditCardCharge = {
    /**
     * A credit card charge is a general charge incurred when a QuickBooks user
     * makes a purchase using a credit card. Credit card charges for purchases
     * can be tracked as expenses (in expense accounts) or as items.
     *
     * The current balance on the credit card becomes part of the accounts
     * payable balance. If a balance is carried on the credit card across time,
     * finance or interest charges can be tracked in QuickBooks.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CreditCardChargeAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.CreditCardChargeAddRq["CreditCardChargeAdd"],
    ): Promise<
      NonNullable<QbdTypes.CreditCardChargeAddRs["CreditCardChargeRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { CreditCardChargeAddRq: { CreditCardChargeAdd: params } },
        "CreditCardChargeAddRs",
        "CreditCardChargeRet",
      ),

    /**
     * The Credit Card charge mod request allows you to modify an existing
     * credit card charge transaction using the SDK. You can modify most of the
     * fields that can be modified in the QuickBooks UI. That is, this request
     * can be used to modify Purchased from, date, credit card and modify lines
     * from the item table and the expense table.
     *
     * The following list describes what you can and cannot due with this
     * request:
     * - You can modify or clear the following fields: Ref Num and Memo
     * - You can modify (not clear) transaction date
     * - You can change the credit card account to support the scenario where
     *   the credit card transaction was created and posted to the wrong credit
     *   card account (impacts your accounting).
     * - You can modify the Purchase from field (Payee Name) to change the Payee
     *   Name on the credit card transaction to a different name (employee, job,
     *   customer, vendor, other name). This field cannot be cleared since it is
     *   required by QB business logic
     * - You cannot modify the amount due directly! (However the amount due will
     *   change when you modify the transaction lines.)
     * - You cannot change a Charge to a Credit.
     * - You cannot Void the charge. Use TxnVoid instead.
     * - You can clear the entire expense table or the entire item table, but
     *   you cannot clear both tables at the same time.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CreditCardChargeMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.CreditCardChargeModRq["CreditCardChargeMod"],
    ): Promise<
      NonNullable<QbdTypes.CreditCardChargeModRs["CreditCardChargeRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { CreditCardChargeModRq: { CreditCardChargeMod: params } },
        "CreditCardChargeModRs",
        "CreditCardChargeRet",
      ),

    /**
     * Queries for the specified credit card charge or charges.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CreditCardChargeQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.CreditCardChargeQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.CreditCardChargeQueryRs["CreditCardChargeRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { CreditCardChargeQueryRq: params },
        "CreditCardChargeQueryRs",
        "CreditCardChargeRet",
      ),
  };

  /**
   * A credit card credit is a credit card refund issued to a customer.
   */
  public creditCardCredit = {
    /**
     * If a QuickBooks user returns merchandise and receives credit, the credit
     * is entered in QuickBooks and assigned to the appropriate expense account.
     * Typically, the assigned expense account reflects the same account,
     * customer, and class that were assigned when the merchandise was first
     * purchased. (The original purchase would be described by a
     * `CreditCardCharge` message.)
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CreditCardCreditAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.CreditCardCreditAddRq["CreditCardCreditAdd"],
    ): Promise<
      NonNullable<QbdTypes.CreditCardCreditAddRs["CreditCardCreditRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { CreditCardCreditAddRq: { CreditCardCreditAdd: params } },
        "CreditCardCreditAddRs",
        "CreditCardCreditRet",
      ),

    /**
     * The Credit Card credit mod request allows you to modify an existing
     * credit card credit transaction using the SDK. You can modify most of the
     * fields that can be modified in the QuickBooks UI. That is, this request
     * can be used to modify Purchased from, date, credit card and modify lines
     * from the item table and the expense table.
     *
     * The following list describes what you can and cannot due with this
     * request:
     * - You can modify or clear the following fields: Ref Num and Memo
     * - You can modify (not clear) transaction date
     * - You can change the credit card account to support the scenario where
     *   the credit card transaction was created and posted to the wrong credit
     *   card account (impacts your accounting).
     * - You can modify the Purchase from field (Payee Name) to change the Payee
     *   Name on the credit card transaction to a different name (employee, job,
     *   customer, vendor, other name). This field cannot be cleared since it is
     *   required by QB business logic
     * - You cannot modify the amount due directly! (However the amount due will
     *   change when you modify the transaction lines.)
     * - You cannot change a Credit to a Charge.
     * - You cannot Void the credit. Use TxnVoid instead.
     * - You can clear the entire expense table or the entire item table, but
     *   you cannot clear both tables at the same time.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CreditCardCreditMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.CreditCardCreditModRq["CreditCardCreditMod"],
    ): Promise<
      NonNullable<QbdTypes.CreditCardCreditModRs["CreditCardCreditRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { CreditCardCreditModRq: { CreditCardCreditMod: params } },
        "CreditCardCreditModRs",
        "CreditCardCreditRet",
      ),

    /**
     * Queries for the specified credit or set of credits.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CreditCardCreditQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.CreditCardCreditQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.CreditCardCreditQueryRs["CreditCardCreditRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { CreditCardCreditQueryRq: params },
        "CreditCardCreditQueryRs",
        "CreditCardCreditRet",
      ),
  };

  /**
   * A credit memo specifies an amount that you owe your customer for some
   * reason, such as overpayment against an invoice, returned merchandise, or
   * for some pre-payment. It reduces a customer’s outstanding balance.
   *
   * Do not confuse a credit memo with a vendor credit, which specifies an
   * amount that a vendor owes you.
   */
  public creditMemo = {
    /**
     * Adds a credit memo. A credit memo specifies an amount that you owe your
     * customer for some reason, such as overpayment against an invoice,
     * returned merchandise, or for some pre-payment. It reduces a customer’s
     * outstanding balance. The `CreditMemo` doesn’t actually get applied until
     * is referenced in a `ReceivePayment` transaction inside the `SetCredit`
     * aggregate.
     *
     * The `CreditMemo` should not be confused with a `VendorCredit`, which
     * specifies an amount that a vendor owes you.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CreditMemoAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.CreditMemoAddRq["CreditMemoAdd"],
    ): Promise<NonNullable<QbdTypes.CreditMemoAddRs["CreditMemoRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CreditMemoAddRq: { CreditMemoAdd: params } },
        "CreditMemoAddRs",
        "CreditMemoRet",
      ),

    /**
     * Modifies an existing credit memo.
     *
     * Some fields in a CreditMemoMod request cannot be cleared. If any of the
     * following fields is included in a credit-memo modify request, it must
     * contain a value:
     * - `CustomerRef`
     * - `ARAccountRef`
     * - `TemplateRef`
     * - `TxnDate`
     * - `IsPending`
     * - `DueDate`
     * - `ShipDate`
     * - `ItemSalesTaxRef`
     * - `IsToBePrinted`
     *
     * Within `CreditMemoLineMod` or `CreditMemoLineGroupMod`:
     * - `ItemRef`
     * - `Quantity`
     * - `Rate`
     * - `Amount`
     * - `SalesTaxCodeRef`
     * - `OverrideItemAccountRef`
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CreditMemoMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.CreditMemoModRq["CreditMemoMod"],
    ): Promise<NonNullable<QbdTypes.CreditMemoModRs["CreditMemoRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CreditMemoModRq: { CreditMemoMod: params } },
        "CreditMemoModRs",
        "CreditMemoRet",
      ),

    /**
     * Queries for the specified credit memo or set of credit memos.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CreditMemoQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.CreditMemoQueryRq = {},
    ): Promise<NonNullable<QbdTypes.CreditMemoQueryRs["CreditMemoRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CreditMemoQueryRq: params },
        "CreditMemoQueryRs",
        "CreditMemoRet",
      ),
  };

  /**
   * A currency is custom currency defined by the user.
   */
  public currency = {
    /**
     * Adds a user-defined currency with the specified name and currency code.
     *
     * Currencies created by users are distinguished from the built-in QB
     * currencies in the `CurrencyRet` object: they are identified as
     * user-defined. User-defined currencies do not get their exchange rates
     * updated automatically by QuickBooks. You’ll always need to manually
     * update the exchange rates. However, other than this, these type of
     * currencies function within QB in the same way as the built-in currencies.
     * If you have not used a user-defined currency in a transaction, you can
     * delete it using `ListDel`. You cannot delete the built-in QB currencies.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CurrencyAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.CurrencyAddRq["CurrencyAdd"],
    ): Promise<NonNullable<QbdTypes.CurrencyAddRs["CurrencyRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CurrencyAddRq: { CurrencyAdd: params } },
        "CurrencyAddRs",
        "CurrencyRet",
      ),

    /**
     * Modifies an existing currency.
     *
     * This request is used primarily for changing the `IsActive` status of the
     * built-in QuickBooks currencies. However, it can also be used to modify
     * anything in user-defined currencies. When used on a built-in currency,
     * this request cannot modify name or currency code, neither of which can be
     * modified in the UI either.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CurrencyMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.CurrencyModRq["CurrencyMod"],
    ): Promise<NonNullable<QbdTypes.CurrencyModRs["CurrencyRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CurrencyModRq: { CurrencyMod: params } },
        "CurrencyModRs",
        "CurrencyRet",
      ),

    /**
     * Queries for built-in and user-defined currencies.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CurrencyQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.CurrencyQueryRq = {},
    ): Promise<NonNullable<QbdTypes.CurrencyQueryRs["CurrencyRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CurrencyQueryRq: params },
        "CurrencyQueryRs",
        "CurrencyRet",
      ),
  };

  /**
   * Customers refer to both the QuickBooks user’s customers and the individual
   * jobs that are being performed for them.
   */
  public customer = {
    /**
     * The customer list includes information about the QuickBooks user’s
     * customers and the individual jobs that are being performed for them. A
     * `CustomerRef` aggregate refers to one of the customers (or customer jobs)
     * on the list. In a request, if a `CustomerRef` aggregate includes both
     * `FullName` and `ListID`, `FullName` will be ignored. Special cases to
     * note:
     *
     * - In `SalesReceipt` and `ReceivePayment` requests, `CustomerRef` refers
     *   to the customer or customer job to which the payment is credited.
     *
     * - In a `TimeTracking` request, CustomerRef refers to the customer or
     *   customer job to which this time could be billed. If `IsBillable` is set
     *   to true, `CustomerRef` is required in `TimeTrackingAdd`.
     *
     * - In an `ExpenseLineAdd` request, if `AccountRef` refers to an A/P
     *   account, `CustomerRef` must refer to a vendor (not to a customer). If
     *   `AccountRef` refers to any other type of account, the `CustomerRef`
     *   must refer to a customer.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CustomerAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.CustomerAddRq["CustomerAdd"],
    ): Promise<NonNullable<QbdTypes.CustomerAddRs["CustomerRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CustomerAddRq: { CustomerAdd: params } },
        "CustomerAddRs",
        "CustomerRet",
      ),

    /**
     * Modifies the customer record.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CustomerMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.CustomerModRq["CustomerMod"],
    ): Promise<NonNullable<QbdTypes.CustomerModRs["CustomerRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CustomerModRq: { CustomerMod: params } },
        "CustomerModRs",
        "CustomerRet",
      ),

    /**
     * Returns data for the specified customers.
     *
     * Important: We highly recommend that you use the `IncludeRetElement` tag
     * in your `CustomerQuery` to include any data you want but do NOT include
     * the `ShipAddress` data in the `Response`, unless you need to get the
     * shipping address for a particular customer. Excluding the shipping
     * address data will significantly improve the performance of the
     * `CustomerQuery`.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CustomerQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.CustomerQueryRq = {},
    ): Promise<NonNullable<QbdTypes.CustomerQueryRs["CustomerRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CustomerQueryRq: params },
        "CustomerQueryRs",
        "CustomerRet",
      ),
  };

  /**
   * Customer types allow business owners to categorize customers in ways that
   * are meaningful for their businesses. For example, a customer type might
   * indicate which industry a customer represents, or which part of the country
   * a customer is in.
   */
  public customerType = {
    /**
     * Customer types allow business owners to categorize customers in ways that
     * are meaningful for their businesses. For example, a customer type might
     * indicate which industry a customer represents, or which part of the
     * country a customer is in.
     *
     * A `CustomerTypeRef` aggregate refers to one of the types on the
     * CustomerType list. In a request, if a `CustomerTypeRef` aggregate
     * includes both `FullName` and `ListID`, `FullName` will be ignored.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CustomerTypeAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.CustomerTypeAddRq["CustomerTypeAdd"],
    ): Promise<NonNullable<QbdTypes.CustomerTypeAddRs["CustomerTypeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CustomerTypeAddRq: { CustomerTypeAdd: params } },
        "CustomerTypeAddRs",
        "CustomerTypeRet",
      ),

    /**
     * Queries for the specified customer type or set of types.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CustomerTypeQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.CustomerTypeQueryRq = {},
    ): Promise<NonNullable<QbdTypes.CustomerTypeQueryRs["CustomerTypeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CustomerTypeQueryRq: params },
        "CustomerTypeQueryRs",
        "CustomerTypeRet",
      ),
  };

  /**
   * A data extension is a custom field that you can add to a list object,
   * transaction, or transaction line item.
   */
  public dataExt = {
    /**
     * Writes data to one data extension (i.e., custom field in QuickBooks).
     * This request can only be invoked if a data extension definition has
     * already been defined for the target object type. That is, before you can
     * perform the `DataExtAdd` on a particular customer, say John Henry, the
     * data extension must already be defined for the `Customer` object. Notice
     * that a data extension definition can be defined in either of two ways:
     * via `DataExtDefAdd` as already described, or via the QuickBooks UI by the
     * user specifying a custom field. Only custom fields can be defined through
     * the UI, not private data extensions.
     *
     * `DataExtAdd` adds a custom field (if `OwnerID` is set to 0) or a private
     * data extension (if `OwnerID` is set to a GUID) containing the specified
     * value. The custom field or private data extension and value is added to
     * the specified list object, or transaction, or transaction line item.
     *
     * `DataExtAdd` will return error 3180 if you invoke this on a custom data
     * ext definition that has been deleted and then re-added from the UI. (You
     * can’t re-add a deleted data ext def via the SDK.) However, you can use
     * `DataExtMod` to write data to that re-added data ext def.
     *
     * Important: If you want to perform a `DataExtAdd` on a transaction line
     * item, you should use custom fields instead of private data extensions
     * because only custom field data will be returned in queries. Currently,
     * private data is not returned.
     *
     * Both `DataExtAdd` and `DataExtMod` cause a Modify event to be generated
     * for the parent object. For example invoking one of these on a `Customer`
     * causes a `Customer` Modify event. The Time Modified value for that parent
     * object is also updated.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/DataExtAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.DataExtAddRq["DataExtAdd"],
    ): Promise<NonNullable<QbdTypes.DataExtAddRs["DataExtRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { DataExtAddRq: { DataExtAdd: params } },
        "DataExtAddRs",
        "DataExtRet",
      ),

    /**
     * This request can only be invoked if a data extension definition has
     * already been added to the target object (for example, the customer John
     * Henry) by a `DataExtDefAdd` or by the user specifying a custom field
     * value for that object via the QuickBooks UI.
     *
     * If you want to clear the data extension value (to make the custom field
     * or private extension blank), you must use `DataExtDel`. The `DataExtMod`
     * request cannot be used to clear the field.
     *
     * Both `DataExtAdd` and `DataExtMod` cause a Modify event to be generated
     * for the parent object. For example invoking one of these on a `Customer`
     * causes a `Customer` Modify event. The Time Modified value for that parent
     * object is also updated.
     *
     * Notice that the Mod operation does not support macros like `DataExtAdd`
     * does.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/DataExtMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.DataExtModRq["DataExtMod"],
    ): Promise<NonNullable<QbdTypes.DataExtModRs["DataExtRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { DataExtModRq: { DataExtMod: params } },
        "DataExtModRs",
        "DataExtRet",
      ),
  };

  /**
   * Date-driven terms show the day of the month by which payment is due and can
   * include a discount for early payment. Payments with standard terms, on the
   * other hand, are due within a certain number of days.
   */
  public dateDrivenTerms = {
    /**
     * Date-driven terms show the day of the month by which payment is due and
     * can include a discount for early payment. For example, the following
     * date-driven term means that payment is due on the 30th of the month, with
     * a 1% discount if payment is made by the 10th: "1% 10 Net 30".
     *
     * Payments with standard terms, on the other hand, are due within a certain
     * number of days.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/DateDrivenTermsAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.DateDrivenTermsAddRq["DateDrivenTermsAdd"],
    ): Promise<
      NonNullable<QbdTypes.DateDrivenTermsAddRs["DateDrivenTermsRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { DateDrivenTermsAddRq: { DateDrivenTermsAdd: params } },
        "DateDrivenTermsAddRs",
        "DateDrivenTermsRet",
      ),

    /**
     * Queries for the specified date-driven terms or set of terms.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/DateDrivenTermsQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.DateDrivenTermsQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.DateDrivenTermsQueryRs["DateDrivenTermsRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { DateDrivenTermsQueryRq: params },
        "DateDrivenTermsQueryRs",
        "DateDrivenTermsRet",
      ),
  };

  /**
   * A deposit is a non-posting transaction that you can use to group payments
   * together. You can also use a deposit to deposit payments directly into a
   * QuickBooks bank account.
   */
  public deposit = {
    /**
     * After you receive payments from customers (see `ReceivePayment`), you can
     * use the `DepositAdd` request to either deposit each payment directly into
     * a QuickBooks bank account or you can group payments together. You can
     * also choose the method you prefer for depositing payments.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/DepositAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.DepositAddRq["DepositAdd"],
    ): Promise<NonNullable<QbdTypes.DepositAddRs["DepositRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { DepositAddRq: { DepositAdd: params } },
        "DepositAddRs",
        "DepositRet",
      ),

    /**
     * Modifies an existing deposit.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/DepositMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.DepositModRq["DepositMod"],
    ): Promise<NonNullable<QbdTypes.DepositModRs["DepositRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { DepositModRq: { DepositMod: params } },
        "DepositModRs",
        "DepositRet",
      ),

    /**
     * This request searches for deposits that match the supplied filters.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/DepositQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.DepositQueryRq = {},
    ): Promise<NonNullable<QbdTypes.DepositQueryRs["DepositRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { DepositQueryRq: params },
        "DepositQueryRs",
        "DepositRet",
      ),
  };

  /**
   * An employee is a person who works for a company. An employee can be a
   * salaried employee, an hourly employee, or a contractor. An employee can
   * also be a vendor.
   */
  public employee = {
    /**
     * Adds an employee with personal data about the employee as well as certain
     * payroll-related data.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/EmployeeAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.EmployeeAddRq["EmployeeAdd"],
    ): Promise<NonNullable<QbdTypes.EmployeeAddRs["EmployeeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { EmployeeAddRq: { EmployeeAdd: params } },
        "EmployeeAddRs",
        "EmployeeRet",
      ),

    /**
     * Modifies an existing employee.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/EmployeeMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.EmployeeModRq["EmployeeMod"],
    ): Promise<NonNullable<QbdTypes.EmployeeModRs["EmployeeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { EmployeeModRq: { EmployeeMod: params } },
        "EmployeeModRs",
        "EmployeeRet",
      ),

    /**
     * Returns employee data.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/EmployeeQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.EmployeeQueryRq = {},
    ): Promise<NonNullable<QbdTypes.EmployeeQueryRs["EmployeeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { EmployeeQueryRq: params },
        "EmployeeQueryRs",
        "EmployeeRet",
      ),
  };

  /**
   * A QuickBooks estimate is a description of a sale that the QuickBooks user
   * proposes to make to a current or prospective customer. An estimate might
   * also be called a “bid” or a “proposal.” In QuickBooks, estimates and
   * invoices use similar fields, and an estimate can be converted into an
   * invoice after the customer accepts the estimate.
   *
   * An estimate is a non-posting transaction, so it does not affect a company’s
   * balance sheet or income statement.
   */
  public estimate = {
    /**
     * Adds an estimate. A QuickBooks estimate is a description of a sale that
     * the QuickBooks user proposes to make to a current or prospective
     * customer. An estimate might also be called a “bid” or a “proposal.” In
     * QuickBooks, estimates and invoices use similar fields, and an estimate
     * can be converted into an invoice after the customer accepts the estimate.
     *
     * An estimate is a non-posting transaction, so it does not affect a
     * company’s balance sheet or income statement.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/EstimateAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.EstimateAddRq["EstimateAdd"],
    ): Promise<NonNullable<QbdTypes.EstimateAddRs["EstimateRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { EstimateAddRq: { EstimateAdd: params } },
        "EstimateAddRs",
        "EstimateRet",
      ),

    /**
     * Modifies the specified estimate.
     *
     * Some fields in an `EstimateMod` request cannot be cleared. If any of the
     * following fields is included in an estimate modify request, it must
     * contain a value:
     * - `CustomerRef`
     * - `TemplateRef`
     * - `TxnDate`
     * - `IsActive`
     * - `CreateChangeOrder`
     * - `DueDate`
     * - `ItemSalesTaxRef`
     *
     * Within `EstimateLineMod` or `EstimateLineGroupMod`:
     * - `ItemRef`
     * - `Quantity`
     * - `Rate`
     * - `Amount`>
     * - `SalesTaxCodeRef`
     * - `Markup`
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/EstimateMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.EstimateModRq["EstimateMod"],
    ): Promise<NonNullable<QbdTypes.EstimateModRs["EstimateRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { EstimateModRq: { EstimateMod: params } },
        "EstimateModRs",
        "EstimateRet",
      ),

    /**
     * Queries for the specified estimate or set of estimates.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/EstimateQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.EstimateQueryRq = {},
    ): Promise<NonNullable<QbdTypes.EstimateQueryRs["EstimateRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { EstimateQueryRq: params },
        "EstimateQueryRs",
        "EstimateRet",
      ),
  };

  /**
   * An inventory adjustment is a non-posting transaction that you can use to
   * adjust the quantity or value of an inventory item
   */
  public inventoryAdjustment = {
    /**
     * Adds an inventory adjustment.
     *
     * If the following conditions aren’t met, you will receive an error if you
     * try to add an inventory adjustment through the SDK:
     * - The QuickBooks company file must be open in single-user mode, unless
     *   you are using QuickBooks Enterprise edition, which allows multi-user
     *   mode for this request. (This is also true in the user interface: you
     *   cannot adjust the inventory while the company file is open in
     *   multi-user mode, again except for Enterprise.)
     * - The inventory adjustment form must be closed in the QuickBooks user
     *   interface.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/InventoryAdjustmentAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.InventoryAdjustmentAddRq["InventoryAdjustmentAdd"],
    ): Promise<
      NonNullable<QbdTypes.InventoryAdjustmentAddRs["InventoryAdjustmentRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { InventoryAdjustmentAddRq: { InventoryAdjustmentAdd: params } },
        "InventoryAdjustmentAddRs",
        "InventoryAdjustmentRet",
      ),

    /**
     * Modifies an inventory adjustment.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/InventoryAdjustmentMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.InventoryAdjustmentModRq["InventoryAdjustmentMod"],
    ): Promise<
      NonNullable<QbdTypes.InventoryAdjustmentModRs["InventoryAdjustmentRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { InventoryAdjustmentModRq: { InventoryAdjustmentMod: params } },
        "InventoryAdjustmentModRs",
        "InventoryAdjustmentRet",
      ),

    /**
     * Queries for the specified inventory adjustment or set of inventory
     * adjustments.
     *
     * You cannot query an inventory adjustment while the inventory adjustment
     * form is open in the QuickBooks user interface.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/InventoryAdjustmentQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.InventoryAdjustmentQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.InventoryAdjustmentQueryRs["InventoryAdjustmentRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { InventoryAdjustmentQueryRq: params },
        "InventoryAdjustmentQueryRs",
        "InventoryAdjustmentRet",
      ),
  };

  /**
   * An inventory site is a location where inventory is stored. For example, a
   * company might have a warehouse, a stockroom, and a showroom, each of which
   * is an inventory site.
   */
  public inventorySite = {
    /**
     * Adds an inventory site.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/InventorySiteAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.InventorySiteAddRq["InventorySiteAdd"],
    ): Promise<NonNullable<QbdTypes.InventorySiteAddRs["InventorySiteRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { InventorySiteAddRq: { InventorySiteAdd: params } },
        "InventorySiteAddRs",
        "InventorySiteRet",
      ),

    /**
     * Modifies an inventory site.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/InventorySiteMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.InventorySiteModRq["InventorySiteMod"],
    ): Promise<NonNullable<QbdTypes.InventorySiteModRs["InventorySiteRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { InventorySiteModRq: { InventorySiteMod: params } },
        "InventorySiteModRs",
        "InventorySiteRet",
      ),

    /**
     * Queries for the specified inventory site or set of inventory sites.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/InventorySiteQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.InventorySiteQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.InventorySiteQueryRs["InventorySiteRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { InventorySiteQueryRq: params },
        "InventorySiteQueryRs",
        "InventorySiteRet",
      ),
  };

  /**
   * An invoice records the amount owed by a customer who purchased goods or
   * services but did not pay in full at the time of the sale. If full payment
   * is received at the time of the sale, it is recorded as a sales receipt, not
   * an invoice.
   *
   * In QuickBooks, invoices and estimates use similar fields, and an estimate
   * can be converted into an invoice after the customer accepts the estimate.
   * However, in the SDK, there is currently no ability to create an invoice
   * directly from an estimate (you cannot link an invoice to an estimate).
   */
  public invoice = {
    /**
     * Adds an invoice.
     *
     * An invoice records the amount owed by a customer who purchased goods or
     * services but did not pay in full at the time of the sale. If full payment
     * is received at the time of the sale, it is recorded as a sales receipt,
     * not an invoice.
     *
     * In QuickBooks, invoices and estimates use similar fields, and an estimate
     * can be converted into an invoice after the customer accepts the estimate.
     * However, in the SDK, there is currently no ability to create an invoice
     * directly from an estimate (you cannot link an invoice to an estimate).
     *
     * If you Add an invoice that has an inventory item on it, QB will
     * automatically calculate COGS and post it to the COGS account. (The
     * inventory item will need to be setup to post to the COGS account and must
     * have a unit cost in it.) However, notice that such an `InvoiceAdd` has
     * sales prices, not cost, so the Add is not impacting the cost of the item.
     * The cost of the item is only affected by purchases (bills and item
     * receipts) sales and inventory adjustments.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/InvoiceAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.InvoiceAddRq["InvoiceAdd"],
    ): Promise<NonNullable<QbdTypes.InvoiceAddRs["InvoiceRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { InvoiceAddRq: { InvoiceAdd: params } },
        "InvoiceAddRs",
        "InvoiceRet",
      ),

    /**
     * Modifies an existing invoice. If you are modifying existing line items,
     * supply an `InvoiceLineMod` and `TxnLineID` for each line you want to
     * modify. If you want to add a new line, supply an `InvoiceLineMod` with
     * its `TxnLineID` value set to -1.
     *
     * Some fields in an `InvoiceMod` request cannot be cleared. If any of the
     * following fields is included in an invoice modify request, it must
     * contain a value:
     * - `CustomerRef`
     * - `ARAccountRef`
     * - `TemplateRef`
     * - `TxnDate`
     * - `IsPending`
     * - `DueDate`
     * - `ItemSalesTaxRef`
     * - `ShipDate`
     * - `IsToBePrinted`
     *
     * Within `InvoiceLineMod` or `InvoiceLineGroupMod`:
     * - `ItemRef`
     * - `Quantity`
     * - `Rate`
     * - `Amount`
     * - `SalesTaxCodeRef`
     * - `OverrideItemAccountRef`
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/InvoiceMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.InvoiceModRq["InvoiceMod"],
    ): Promise<NonNullable<QbdTypes.InvoiceModRs["InvoiceRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { InvoiceModRq: { InvoiceMod: params } },
        "InvoiceModRs",
        "InvoiceRet",
      ),

    /**
     * Returns invoice data.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/InvoiceQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.InvoiceQueryRq = {},
    ): Promise<NonNullable<QbdTypes.InvoiceQueryRs["InvoiceRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { InvoiceQueryRq: params },
        "InvoiceQueryRs",
        "InvoiceRet",
      ),
  };

  /**
   * A discount item is a percentage or a fixed amount that will be subtracted
   * from a total or subtotal.
   */
  public itemDiscount = {
    /**
     * Adds a discount item. A discount item is a percentage or a fixed amount
     * that will be subtracted from a total or subtotal. Items should be
     * subtotaled (using an `ItemSubtotal` item) before a discount item is
     * applied to them, because a discount only acts on the line that is
     * directly above it. A discount item is different from a discount for early
     * payment, which is represented as part of a `StandardTerms` object or
     * DateDrivenTerms object. Note: When you specify an `ItemDiscount` item in
     * any transaction (by using an `ItemRef`), do not specify a `Quantity` in
     * the transaction. If you do, you will receive an error.
     *
     * Be Sharp WhenUsing Flat Discounts: Flat rate discounts are treated VERY
     * differently vs. percentage discounts. A percentage discount only applies
     * to the line right above it, so all of the tax implications for discounts
     * apply ONLY to that line (Note that the story gets more complicated here
     * for group items, subtotal lines, etc). A flat rate discount applies to
     * EVERY line that is recorded above the discount. Thus, the $10.00 off you
     * see is applied equally to the $100.00 Nontaxable target and the $100.00
     * Taxable target. Thus, the sales tax for the 10.00 discount totals up to
     * -$5.00. Therefore, for the desired behavior, the user must fill out the
     * invoice like this: Item $100.00 Non Item $100.00 Tax Discount $20.00 Tax
     * In this scenario, the $20.00 discount is properly distributed to be half
     * taxed and half not taxed, so the taxable amount for the discount line is
     * only -$10.00. The moral of the story: Non-Taxable Discounts are VERY
     * dangerous. You should almost never use them unless discounts in your
     * state are never applied to sales tax.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemDiscountAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemDiscountAddRq["ItemDiscountAdd"],
    ): Promise<NonNullable<QbdTypes.ItemDiscountAddRs["ItemDiscountRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemDiscountAddRq: { ItemDiscountAdd: params } },
        "ItemDiscountAddRs",
        "ItemDiscountRet",
      ),

    /**
     * Modifies a discount item.
     *
     * You can modify the account ref, using the `AccountRef` aggregate and the
     * `ApplyAccountRefToExistingTxns` boolean. You need to use the
     * `ApplyAccountRefToExistingTxns` boolean because the QuickBooks UI
     * displays a prompt asking whether the change should apply to existing
     * transactions or not. Specifying True for the boolean basically dismisses
     * this with a “Yes” answer, allowing your changes to be made and changes
     * any existing transactions that use the item with that `AccountRef`.
     * Specifying “False” means that the mod will not take affect if there are
     * existing transactions. Setting this to “True” should be used with caution
     * and normally only after some user has indicated that they want those
     * changes made to all those existing transactions! If any affected
     * transactions are protected by a closing date and password, the
     * `AccountRef` changes will not be made and so the Mod request will return
     * an error without making the requested Mod.
     *
     * Be Sharp When Using Flat Discounts: Flat rate discounts are treated VERY
     * differently vs. percentage discounts. A percentage discount only applies
     * to the line right above it, so all of the tax implications for discounts
     * apply ONLY to that line (Note that the story gets more complicated here
     * for group items, subtotal lines, etc). A flat rate discount applies to
     * EVERY line that is recorded above the discount. Thus, the $10.00 off you
     * see is applied equally to the $100.00 Nontaxable target and the $100.00
     * Taxable target. Thus, the sales tax for the 10.00 discount totals up to
     * -$5.00. Therefore, for the desired behavior, the user must fill out the
     * invoice like this: Item $100.00 Non Item $100.00 Tax Discount $20.00 Tax
     * In this scenario, the $20.00 discount is properly distributed to be half
     * taxed and half not taxed, so the taxable amount for the discount line is
     * only -$10.00. The moral of the story: Non-Taxable Discounts are VERY
     * dangerous. You should almost never use them unless discounts in your
     * state are never applied to sales tax.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemDiscountMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemDiscountModRq["ItemDiscountMod"],
    ): Promise<NonNullable<QbdTypes.ItemDiscountModRs["ItemDiscountRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemDiscountModRq: { ItemDiscountMod: params } },
        "ItemDiscountModRs",
        "ItemDiscountRet",
      ),

    /**
     * Queries for the specified discount item or set of items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemDiscountQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemDiscountQueryRq = {},
    ): Promise<NonNullable<QbdTypes.ItemDiscountQueryRs["ItemDiscountRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemDiscountQueryRq: params },
        "ItemDiscountQueryRs",
        "ItemDiscountRet",
      ),
  };

  /**
   * Fixed-asset items represent assets that will benefit a business for longer
   * than one year. The purchase price of these fixed assets is typically
   * expensed over a period of years, rather than in the year the purchase was
   * made.
   */
  public itemFixedAsset = {
    /**
     * Adds a fixed-asset item. Fixed-asset items represent assets that will
     * benefit a business for longer than one year. The purchase price of these
     * fixed assets is typically expensed over a period of years, rather than in
     * the year the purchase was made.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemFixedAssetAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemFixedAssetAddRq["ItemFixedAssetAdd"],
    ): Promise<
      NonNullable<QbdTypes.ItemFixedAssetAddRs["ItemFixedAssetRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemFixedAssetAddRq: { ItemFixedAssetAdd: params } },
        "ItemFixedAssetAddRs",
        "ItemFixedAssetRet",
      ),

    /**
     * Modifies a fixed asset item. Fixed-asset items represent assets that will
     * benefit a business for longer than one year. The purchase price of these
     * fixed assets is typically expensed over a period of years, rather than in
     * the year the purchase was made.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemFixedAssetMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemFixedAssetModRq["ItemFixedAssetMod"],
    ): Promise<
      NonNullable<QbdTypes.ItemFixedAssetModRs["ItemFixedAssetRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemFixedAssetModRq: { ItemFixedAssetMod: params } },
        "ItemFixedAssetModRs",
        "ItemFixedAssetRet",
      ),

    /**
     * Queries for the specified fixed-asset item or set of fixed asset items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemFixedAssetQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemFixedAssetQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.ItemFixedAssetQueryRs["ItemFixedAssetRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemFixedAssetQueryRq: params },
        "ItemFixedAssetQueryRs",
        "ItemFixedAssetRet",
      ),
  };

  /**
   * An item group represents items that are grouped together for fast entry.
   */
  public itemGroup = {
    /**
     * Adds an item group. `ItemGroup` objects represent items that are grouped
     * together for fast entry, and an `ItemGroupRef` aggregate refers to one of
     * these item groups. In a request, if an `ItemGroupRef` aggregate includes
     * both `FullName` and `ListID`, `FullName` will be ignored. You can use an
     * `ItemGroupQuery` request to get information about all the item groups
     * that are set up in the QuickBooks file.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemGroupAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemGroupAddRq["ItemGroupAdd"],
    ): Promise<NonNullable<QbdTypes.ItemGroupAddRs["ItemGroupRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemGroupAddRq: { ItemGroupAdd: params } },
        "ItemGroupAddRs",
        "ItemGroupRet",
      ),

    /**
     * Modifies an item group.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemGroupMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemGroupModRq["ItemGroupMod"],
    ): Promise<NonNullable<QbdTypes.ItemGroupModRs["ItemGroupRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemGroupModRq: { ItemGroupMod: params } },
        "ItemGroupModRs",
        "ItemGroupRet",
      ),

    /**
     * An `ItemGroupQuery` request will return information about all the item
     * groups that are set up in the QuickBooks file.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/itemgroupquery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemGroupQueryRq = {},
    ): Promise<NonNullable<QbdTypes.ItemGroupQueryRs["ItemGroupRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemGroupQueryRq: params },
        "ItemGroupQueryRs",
        "ItemGroupRet",
      ),
  };

  /**
   * An inventory item is any merchandise or part that a business purchases,
   * tracks as inventory, and then resells.
   */
  public itemInventory = {
    /**
     * Adds an inventory item. An inventory item is any merchandise or part that
     * a business purchases, tracks as inventory, and then resells. In
     * QuickBooks, information about an inventory item is grouped into three
     * categories:
     * 1. Purchase Information includes `PurchaseDesc`, `PurchaseCost`,
     *    `COGSAccountRef`, and `PrefVendorRef`.
     * 2. Sales Information includes `SalesDesc`, `SalesPrice`, and
     *    `SalesTaxCodeRef`.
     * 3. Inventory Information includes `AssetAccountRef`, `ReorderPoint`,
     *    `QuantityOnHand`, `TotalValue`, and `InventoryDate`.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemInventoryAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemInventoryAddRq["ItemInventoryAdd"],
    ): Promise<NonNullable<QbdTypes.ItemInventoryAddRs["ItemInventoryRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemInventoryAddRq: { ItemInventoryAdd: params } },
        "ItemInventoryAddRs",
        "ItemInventoryRet",
      ),

    /**
     * Modifies an inventory item.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemInventoryMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemInventoryModRq["ItemInventoryMod"],
    ): Promise<NonNullable<QbdTypes.ItemInventoryModRs["ItemInventoryRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemInventoryModRq: { ItemInventoryMod: params } },
        "ItemInventoryModRs",
        "ItemInventoryRet",
      ),

    /**
     * Queries for the specified inventory item or set of items.
     *
     * Notice that certain modifications to the item can be caused by other
     * transactions, such as `ItemReceipts` where the item’s on hand quantity is
     * increased. Modifications through these transactions do not result in
     * changing the `TimeModified` stamp (only the `Mod` operation will do
     * that), but those changes will be detected when you use the
     * `FromModifiedDate`/`ToModifiedDate` filters in your query. Notice that
     * you cannot get an inventory asset value from QuickBooks using this query.
     * Instead, you need to use the General Summary Report query (which
     * currently doesn’t include Assembly Items). Suppose you needed a way to
     * search for the amount on hand of items that have had their amount changed
     * since a certain date. Again, you would not use this query, but a
     * `GeneralDetailReportQuery` that has its `GeneralDetailReportType` set to
     * “InventoryValuationDetail”. This will tell you which items changed by how
     * much. Also, suppose you wanted the on-hand quantity from QB as of a
     * specific date. You would use a General Summary Report of the type
     * Inventory Valuation Summary. (Again, this report doesn’t include
     * Inventory Assemblies.)
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemInventoryQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemInventoryQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.ItemInventoryQueryRs["ItemInventoryRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemInventoryQueryRq: params },
        "ItemInventoryQueryRs",
        "ItemInventoryRet",
      ),
  };

  /**
   * An inventory assembly item is an item that is assembled or manufactured
   * from other inventory items. The items and/or assemblies that make up the
   * assembly are called components.
   */
  public itemInventoryAssembly = {
    /**
     * Adds an inventory assembly item, which is an item that is assembled or
     * manufactured from other inventory items. The items and/or assemblies that
     * make up the assembly are called components.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemInventoryAssemblyAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemInventoryAssemblyAddRq["ItemInventoryAssemblyAdd"],
    ): Promise<
      NonNullable<
        QbdTypes.ItemInventoryAssemblyAddRs["ItemInventoryAssemblyRet"]
      >
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemInventoryAssemblyAddRq: { ItemInventoryAssemblyAdd: params } },
        "ItemInventoryAssemblyAddRs",
        "ItemInventoryAssemblyRet",
      ),

    /**
     * Modifies an inventory assembly item. If you are adding components to the
     * assembly, remember that the component items and/or assemblies that make
     * up the assembly are limited in number.
     *
     * You can modify the income account ref, using the `IncomeAccountRef`
     * aggregate and the `ApplyIncomeAccountRefToExistingTxns` boolean. You need
     * to use the `ApplyIncomeAccountRefToExistingTxns` boolean because the
     * QuickBooks UI displays a prompt asking whether the change should apply to
     * existing transactions or not. Specifying `True` for the boolean basically
     * dismisses this with a “Yes” answer, allowing your changes to be made and
     * changes any existing transactions that use the item with that AccountRef.
     * Specifying “False” means that the mod will not take affect if there are
     * existing transactions. Setting this to “True” should be used with caution
     * and normally only after some user has indicated that they want those
     * changes made to all those existing transactions! If any affected
     * transactions are protected by a closing date and password, the
     * `IncomeAccountRef` changes will not be made and so the Mod request will
     * return an error without making the requested Mod.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemInventoryAssemblyMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemInventoryAssemblyModRq["ItemInventoryAssemblyMod"],
    ): Promise<
      NonNullable<
        QbdTypes.ItemInventoryAssemblyModRs["ItemInventoryAssemblyRet"]
      >
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemInventoryAssemblyModRq: { ItemInventoryAssemblyMod: params } },
        "ItemInventoryAssemblyModRs",
        "ItemInventoryAssemblyRet",
      ),

    /**
     * Queries for the specified inventory assembly item or set of assembly
     * items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemInventoryAssemblyQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemInventoryAssemblyQueryRq = {},
    ): Promise<
      NonNullable<
        QbdTypes.ItemInventoryAssemblyQueryRs["ItemInventoryAssemblyRet"]
      >
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemInventoryAssemblyQueryRq: params },
        "ItemInventoryAssemblyQueryRs",
        "ItemInventoryAssemblyRet",
      ),
  };

  /**
   * A non-inventory item is any material or part that a business buys but does
   * not keep on hand as inventory. There are two types of non-inventory items:
   * 1. Materials or parts that are part of the business’s overhead (for
   *    example, office supplies
   * 2. Materials or parts that the business buys to finish a specific job and
   *    then charges back to the customer.
   */
  public itemNonInventory = {
    /**
     * Adds a non-inventory item, which is any material or part that a business
     * buys but does not keep on hand as inventory. There are two types of
     * non-inventory items:
     * 1. Materials or parts that are part of the business’s overhead (for
     *    example, office supplies
     * 2. Materials or parts that the business buys to finish a specific job and
     *    then charges back to the customer.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemNonInventoryAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemNonInventoryAddRq["ItemNonInventoryAdd"],
    ): Promise<
      NonNullable<QbdTypes.ItemNonInventoryAddRs["ItemNonInventoryRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemNonInventoryAddRq: { ItemNonInventoryAdd: params } },
        "ItemNonInventoryAddRs",
        "ItemNonInventoryRet",
      ),

    /**
     * Modifies a non inventory item.
     *
     * About `SalesOrPurchaseMod` versus `SalesAndPurchaseMod` in an
     * `ItemNonInventoryMod` request: You cannot change the reimbursable status
     * of a non-inventory item through the SDK. For example, if a non-inventory
     * item is marked as non-reimbursable in QuickBooks, you cannot send a
     * modify request that includes a `SalesAndPurchaseMod` aggregate.
     * Similarly, if you send an `ItemNonInventoryAdd` request that includes a
     * `SalesOrPurchase` aggregate, you cannot later modify that item using a
     * `SalesAndPurchaseMod` aggregate.
     *
     * You can modify the various account references using the appropriate
     * account reference aggregate and the matching Apply Account
     * `RefToExistingTxns` boolean. You need to use the boolean when you change
     * an account ref because the QuickBooks UI displays a prompt asking whether
     * the change should apply to existing transactions or not. Specifying True
     * for the boolean basically dismisses this with a “Yes” answer, allowing
     * your changes to be made and changes any existing transactions that use
     * the item with that `AccountRef`. Specifying “False” means that the mod
     * will not take affect if there are existing transactions. Setting this to
     * “True” should be used with caution and normally only after some user has
     * indicated that they want those changes made to all those existing
     * transactions! If any affected transactions are protected by a closing
     * date and password, the `AccountRef` changes will not be made and so the
     * Mod request will return an error without making the requested Mod.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemNonInventoryMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemNonInventoryModRq["ItemNonInventoryMod"],
    ): Promise<
      NonNullable<QbdTypes.ItemNonInventoryModRs["ItemNonInventoryRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemNonInventoryModRq: { ItemNonInventoryMod: params } },
        "ItemNonInventoryModRs",
        "ItemNonInventoryRet",
      ),

    /**
     * Queries for the specified non-inventory item or set of items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemNonInventoryQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemNonInventoryQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.ItemNonInventoryQueryRs["ItemNonInventoryRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemNonInventoryQueryRq: params },
        "ItemNonInventoryQueryRs",
        "ItemNonInventoryRet",
      ),
  };

  /**
   * An other charge item are miscellaneous charges that do not fall into the
   * categories of service, labor, materials, or parts. Examples include
   * delivery charges, setup fees, and service charges.
   */
  public itemOtherCharge = {
    /**
     * Adds an other charge item, which are miscellaneous charges that do not
     * fall into the categories of service, labor, materials, or parts. Examples
     * include delivery charges, setup fees, and service charges.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemOtherChargeAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemOtherChargeAddRq["ItemOtherChargeAdd"],
    ): Promise<
      NonNullable<QbdTypes.ItemOtherChargeAddRs["ItemOtherChargeRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemOtherChargeAddRq: { ItemOtherChargeAdd: params } },
        "ItemOtherChargeAddRs",
        "ItemOtherChargeRet",
      ),

    /**
     * Modifies an other charge item.
     *
     * About `SalesOrPurchaseMod` versus `SalesAndPurchaseMod` in an
     * `ItemOtherChargeMod` request: You cannot change the reimbursable status
     * of an other-charge item through the SDK. For example, if an other-charge
     * item is marked as non-reimbursable in QuickBooks, you cannot send a
     * modify request that includes a `SalesAndPurchaseMod` aggregate.
     * Similarly, if you send an `ItemOtherChargeAdd` request that includes a
     * SalesOrPurchase aggregate, you cannot later modify that item using a
     * `SalesAndPurchaseMod` aggregate.
     *
     * You can modify the various account references using the appropriate
     * account reference aggregate and the matching Apply Account
     * `RefToExistingTxns` boolean. You need to use the boolean when you change
     * an account ref because the QuickBooks UI displays a prompt asking whether
     * the change should apply to existing transactions or not. Specifying
     * `True` for the boolean basically dismisses this with a “Yes” answer,
     * allowing your changes to be made and changes any existing transactions
     * that use the item with that AccountRef. Specifying “False” means that the
     * mod will not take affect if there are existing transactions. Setting this
     * to “True” should be used with caution and normally only after some user
     * has indicated that they want those changes made to all those existing
     * transactions! If any affected transactions are protected by a closing
     * date and password, the AccountRef changes will not be made and so the Mod
     * request will return an error without making the requested Mod.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemOtherChargeMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemOtherChargeModRq["ItemOtherChargeMod"],
    ): Promise<
      NonNullable<QbdTypes.ItemOtherChargeModRs["ItemOtherChargeRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemOtherChargeModRq: { ItemOtherChargeMod: params } },
        "ItemOtherChargeModRs",
        "ItemOtherChargeRet",
      ),

    /**
     * Queries for the specified other charge item or set of items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemOtherChargeQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemOtherChargeQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.ItemOtherChargeQueryRs["ItemOtherChargeRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemOtherChargeQueryRq: params },
        "ItemOtherChargeQueryRs",
        "ItemOtherChargeRet",
      ),
  };

  /**
   * A payment item is a type of item that is used to record a payment that is
   * received from a customer.
   */
  public itemPayment = {
    /**
     * Adds an item payment or set of payments. You can use this request to
     * create a payment for a customer or vendor.
     *
     * For an `ItemPaymentAdd` request, you can “set” the “Group with
     * undeposited funds” radio button in QuickBooks either by not specifying
     * `DepositToAccountRef` at all, or by specifying the special
     * UndepositedFunds account for the `DepositToAccountRef`.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemPaymentAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemPaymentAddRq["ItemPaymentAdd"],
    ): Promise<NonNullable<QbdTypes.ItemPaymentAddRs["ItemPaymentRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemPaymentAddRq: { ItemPaymentAdd: params } },
        "ItemPaymentAddRs",
        "ItemPaymentRet",
      ),

    /**
     * Modifies an item payment.
     *
     * For an `ItemPaymentMod` request, you can “set” the “Group with
     * undeposited funds” radio button in QuickBooks by either attempting to
     * clear the DepositToAccountRef, or by specifying the account whose
     * `SpecialAccountType` is `UndepositedFunds` for the `DepositToAccountRef`.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemPaymentMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemPaymentModRq["ItemPaymentMod"],
    ): Promise<NonNullable<QbdTypes.ItemPaymentModRs["ItemPaymentRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemPaymentModRq: { ItemPaymentMod: params } },
        "ItemPaymentModRs",
        "ItemPaymentRet",
      ),

    /**
     * Queries for the specified item payment or set of payments.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemPaymentQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemPaymentQueryRq = {},
    ): Promise<NonNullable<QbdTypes.ItemPaymentQueryRs["ItemPaymentRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemPaymentQueryRq: params },
        "ItemPaymentQueryRs",
        "ItemPaymentRet",
      ),
  };

  /**
   * An item receipt transaction is a transaction entered in QuickBooks when a
   * shipment is received from a vendor.
   */
  public itemReceipt = {
    /**
     * Adds an item receipt transaction, which is a transaction entered in
     * QuickBooks when a shipment is received from a vendor. If you use
     * `PurchaseOrders` to order from the vendor, you can link the item receipt
     * to purchase order to receive the items against the purchase orders to
     * automatically update (and eventually close) the purchase orders. This
     * linking also saves you having to re-create line items as they are pulled
     * in automatically from the purchase order. You can do this linking only in
     * the item receipt add, not in the mod.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemReceiptAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemReceiptAddRq["ItemReceiptAdd"],
    ): Promise<NonNullable<QbdTypes.ItemReceiptAddRs["ItemReceiptRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemReceiptAddRq: { ItemReceiptAdd: params } },
        "ItemReceiptAddRs",
        "ItemReceiptRet",
      ),

    /**
     * Modifies an existing item receipt.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemReceiptMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemReceiptModRq["ItemReceiptMod"],
    ): Promise<NonNullable<QbdTypes.ItemReceiptModRs["ItemReceiptRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemReceiptModRq: { ItemReceiptMod: params } },
        "ItemReceiptModRs",
        "ItemReceiptRet",
      ),

    /**
     * An item receipt transaction is entered in QuickBooks when a shipment is
     * received from a vendor.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemReceiptQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemReceiptQueryRq = {},
    ): Promise<NonNullable<QbdTypes.ItemReceiptQueryRs["ItemReceiptRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemReceiptQueryRq: params },
        "ItemReceiptQueryRs",
        "ItemReceiptRet",
      ),
  };

  /**
   * A sales-tax item is an item used to calculate a single sales tax that is
   * collected at a specified rate and paid to a single agency.
   */
  public itemSalesTax = {
    /**
     * Adds a sales-tax item, which is an item used to calculate a single sales
     * tax that is collected at a specified rate and paid to a single agency.
     * (Compare with the `ItemSalesTaxGroupAdd` message.)
     *
     * An `ItemSalesTaxRef` aggregate refers to an item on this list. In a
     * request, if an `ItemSalesTaxRef` aggregate includes both `FullName` and
     * `ListID`, `FullName` will be ignored. Taxes can be reflected in
     * transaction line items.
     *
     * The following information refers to invoices specifically, but it also
     * applies to sales receipts. Generally it's best to assign a tax item or
     * tax group item to an invoice and allow QuickBooks to apply the same tax
     * to all taxable items on the invoice. However in some situations multiple
     * tax combinations are required, so this method doesn’t work. In this case
     * one must use techniques to apply the taxes in the invoice itself as line
     * items. Using lines to apply taxes isn’t always straight forward. When
     * applying taxes as line items, only single tax items can be used, tax
     * groups can only be used for the entire invoice. If you have multiple
     * taxes which apply to all taxable items, and one or more other taxes that
     * only apply to some of the items on an invoice its better to use a tax
     * group which applies to the entire invoice for the taxes which applies to
     * all taxable items and then apply the other taxes in the invoice itself.
     * One applies a tax or tax group to an entire invoice by using the
     * `ItemSalesTaxRef` aggregate. One can use subtotals to apply a single tax
     * line to multiple items in an invoice, but the tax is only applied
     * automatically for the first tax line after the subtotal line. Any other
     * tax lines which need to be applied to the subtotal line must supply their
     * own amount. If you don’t supply an amount the amount comes out as zero
     * and the tax line is useless. When one does supply an amount, the amount
     * of tax on the subtotal also shows up in the rate column for that tax
     * line. There isn’t any way for the rate to show up as anything other than
     * the amount of the tax. If you have a complicated tax situation where no
     * single tax applies to all taxable items on the invoice, you must choose a
     * zero percent tax to apply for the entire invoice. It is recommended to
     * name such a tax item “Tax Calculated On Invoice” so that it’s clear that
     * the tax is not being applied by QuickBooks on the entire invoice.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemSalesTaxAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemSalesTaxAddRq["ItemSalesTaxAdd"],
    ): Promise<NonNullable<QbdTypes.ItemSalesTaxAddRs["ItemSalesTaxRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemSalesTaxAddRq: { ItemSalesTaxAdd: params } },
        "ItemSalesTaxAddRs",
        "ItemSalesTaxRet",
      ),

    /**
     * Modifies an existing sales-tax item.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemSalesTaxMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemSalesTaxModRq["ItemSalesTaxMod"],
    ): Promise<NonNullable<QbdTypes.ItemSalesTaxModRs["ItemSalesTaxRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemSalesTaxModRq: { ItemSalesTaxMod: params } },
        "ItemSalesTaxModRs",
        "ItemSalesTaxRet",
      ),

    /**
     * Queries for the specified sales-tax item or set of items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemSalesTaxQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemSalesTaxQueryRq = {},
    ): Promise<NonNullable<QbdTypes.ItemSalesTaxQueryRs["ItemSalesTaxRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemSalesTaxQueryRq: params },
        "ItemSalesTaxQueryRs",
        "ItemSalesTaxRet",
      ),
  };

  /**
   * A sales-tax group item is an item used for calculating two or more sales
   * taxes grouped together and applied to the same sale. For example, local and
   * state taxes could be tracked separately but applied to a sale as one tax.
   */
  public itemSalesTaxGroup = {
    /**
     * Adds a sales-tax group item, which is an item used for calculating two or
     * more sales taxes grouped together and applied to the same sale. For
     * example, local and state taxes could be tracked separately but applied to
     * a sale as one tax. (Compare with the `ItemSalesTaxAdd` message.)
     *
     * Taxes can be reflected in transaction line items The following
     * information refers to invoices specifically, but it also applies to sales
     * receipts. Generally its best to assign a tax item or tax group item to an
     * invoice and allow QuickBooks to apply the same tax to all taxable items
     * on the invoice. However in some situations multiple tax combinations are
     * required, so this method doesn’t work. In this case one must use
     * techniques to apply the taxes in the invoice itself as line items. Using
     * lines to apply taxes isn’t always straight forward. When applying taxes
     * as line items, only single tax items can be used, tax groups can only be
     * used for the entire invoice. If you have multiple taxes which apply to
     * all taxable items, and one or more other taxes that only apply to some of
     * the items on an invoice its better to use a tax group which applies to
     * the entire invoice for the taxes which applies to all taxable items and
     * then apply the other taxes in the invoice itself. One applies a tax or
     * tax group to an entire invoice by using the `ItemSalesTaxRef` aggregate.
     * One can use subtotals to apply a single tax line to multiple items in an
     * invoice, but the tax is only applied automatically for the first tax line
     * after the subtotal line. Any other tax lines which need to be applied to
     * the subtotal line must supply their own amount. If you don’t supply an
     * amount the amount comes out as zero and the tax line is useless. When one
     * does supply an amount, the amount of tax on the subtotal also shows up in
     * the rate column for that tax line. There isn’t any way for the rate to
     * show up as anything other than the amount of the tax. If you have a
     * complicated tax situation where no single tax applies to all taxable
     * items on the invoice, you must choose a zero percent tax to apply for the
     * entire invoice. It is recommended to name such a tax item “Tax Calculated
     * On Invoice” so that it’s clear that the tax is not being applied by
     * QuickBooks on the entire invoice.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemSalesTaxGroupAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemSalesTaxGroupAddRq["ItemSalesTaxGroupAdd"],
    ): Promise<
      NonNullable<QbdTypes.ItemSalesTaxGroupAddRs["ItemSalesTaxGroupRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemSalesTaxGroupAddRq: { ItemSalesTaxGroupAdd: params } },
        "ItemSalesTaxGroupAddRs",
        "ItemSalesTaxGroupRet",
      ),

    /**
     * Modifies an existing sales-tax group item.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemSalesTaxGroupMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemSalesTaxGroupModRq["ItemSalesTaxGroupMod"],
    ): Promise<
      NonNullable<QbdTypes.ItemSalesTaxGroupModRs["ItemSalesTaxGroupRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemSalesTaxGroupModRq: { ItemSalesTaxGroupMod: params } },
        "ItemSalesTaxGroupModRs",
        "ItemSalesTaxGroupRet",
      ),

    /**
     * Queries for the specified sales-tax group item or set of group items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemSalesTaxGroupQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemSalesTaxGroupQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.ItemSalesTaxGroupQueryRs["ItemSalesTaxGroupRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ItemSalesTaxGroupQueryRq: params },
        "ItemSalesTaxGroupQueryRs",
        "ItemSalesTaxGroupRet",
      ),
  };

  /**
   * A service item is an item that refers to services that a business charges
   * for or purchases. Examples include specialized labor, consulting hours, and
   * professional fees.
   */
  public itemService = {
    /**
     * Adds a service item, which is an item that refers to services that a
     * business charges for or purchases. Examples include specialized labor,
     * consulting hours, and professional fees. An `ItemServiceRef` aggregate
     * refers to an item on the ItemService list. In a request, if an
     * `ItemServiceRef` aggregate includes both `FullName` and `ListID`,
     * `FullName` will be ignored.
     *
     * In a `TimeTracking` message, `ItemServiceRef` refers to the type of work.
     * If no `CustomerRef` is specified, then `ItemServiceRef` is not needed. If
     * `IsBillable` is set to true, then `TimeTrackingAdd` must include both
     * `ItemServiceRef` and `CustomerRef`.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemServiceAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemServiceAddRq["ItemServiceAdd"],
    ): Promise<NonNullable<QbdTypes.ItemServiceAddRs["ItemServiceRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemServiceAddRq: { ItemServiceAdd: params } },
        "ItemServiceAddRs",
        "ItemServiceRet",
      ),

    /**
     * Modifies an existing service item.
     *
     * About `SalesOrPurchaseMod` versus `SalesAndPurchaseMod` in an
     * `ItemServiceMod` request:
     * - You cannot change the reimbursable status of a service item through the
     *   SDK. For example, if a service item is marked as non-reimbursable in
     *   QuickBooks, you cannot send a modify request that includes a
     *   `SalesAndPurchaseMod` aggregate. Similarly, if you send an
     *   `ItemServiceAdd` request that includes a `SalesOrPurchase` aggregate,
     *   you cannot later modify that item using a `SalesAndPurchaseMod`
     *   aggregate.
     * - You can modify the various account references using the appropriate
     *   account reference aggregate and the matching `RefToExistingTxns`
     *   boolean. You need to use the boolean when you change an account ref
     *   because the QuickBooks UI displays a prompt asking whether the change
     *   should apply to existing transactions or not.
     *   - Specifying `False` means that the mod will not take affect if there
     *     are existing transactions.
     *   - Specifying `True` for the boolean basically dismisses this with a
     *     “Yes” answer, allowing your changes to be made and changes any
     *     existing transactions that use the item with that `AccountRef`.
     *     Setting this to `True` should be used with caution and normally only
     *     after some user has indicated that they want those changes made to
     *     all those existing transactions! If any affected transactions are
     *     protected by a closing date and password, the `AccountRef` changes
     *     will not be made and so the `Mod` request will return an error
     *     without making the requested `Mod`.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemServiceMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemServiceModRq["ItemServiceMod"],
    ): Promise<NonNullable<QbdTypes.ItemServiceModRs["ItemServiceRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemServiceModRq: { ItemServiceMod: params } },
        "ItemServiceModRs",
        "ItemServiceRet",
      ),

    /**
     * Queries for the specified service item or set of items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemServiceQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemServiceQueryRq = {},
    ): Promise<NonNullable<QbdTypes.ItemServiceQueryRs["ItemServiceRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemServiceQueryRq: params },
        "ItemServiceQueryRs",
        "ItemServiceRet",
      ),
  };

  public itemSites = {
    /**
     * Queries for the specified items at the specified inventory site.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemSitesQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemSitesQueryRq = {},
    ): Promise<NonNullable<QbdTypes.ItemSitesQueryRs["ItemSitesRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemSitesQueryRq: params },
        "ItemSitesQueryRs",
        "ItemSitesRet",
      ),
  };

  /**
   * A subtotal item is used on a sales form to add up the amounts of the item
   * lines above it, up to the previous subtotal.
   */
  public itemSubtotal = {
    /**
     * Adds a subtotal item. On a sales form, a subtotal item will add up the
     * amounts of the item lines above it, up to the previous subtotal. Items
     * must be subtotaled before a discount is applied (using `ItemDiscount`),
     * because a discount applies only to the line that is directly above it.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemSubtotalAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ItemSubtotalAddRq["ItemSubtotalAdd"],
    ): Promise<NonNullable<QbdTypes.ItemSubtotalAddRs["ItemSubtotalRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemSubtotalAddRq: { ItemSubtotalAdd: params } },
        "ItemSubtotalAddRs",
        "ItemSubtotalRet",
      ),

    /**
     * Modifies an existing subtotal item.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemSubtotalMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ItemSubtotalModRq["ItemSubtotalMod"],
    ): Promise<NonNullable<QbdTypes.ItemSubtotalModRs["ItemSubtotalRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemSubtotalModRq: { ItemSubtotalMod: params } },
        "ItemSubtotalModRs",
        "ItemSubtotalRet",
      ),

    /**
     * Queries for the specified subtotal item or set of items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ItemSubtotalQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ItemSubtotalQueryRq = {},
    ): Promise<NonNullable<QbdTypes.ItemSubtotalQueryRs["ItemSubtotalRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ItemSubtotalQueryRq: params },
        "ItemSubtotalQueryRs",
        "ItemSubtotalRet",
      ),
  };

  /**
   * A job type can be used to separate jobs into any categories that are
   * meaningful to the business.
   */
  public jobType = {
    /**
     * Adds a job type. A job type can be used to separate jobs into any
     * categories that are meaningful to the business.
     *
     * A `JobTypeRef` aggregate refers to a job type on the `JobType` list. In a
     * request, if a `JobTypeRef` aggregate includes both `FullName` and
     * `ListID`, `FullName` will be ignored.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/JobTypeAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.JobTypeAddRq["JobTypeAdd"],
    ): Promise<NonNullable<QbdTypes.JobTypeAddRs["JobTypeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { JobTypeAddRq: { JobTypeAdd: params } },
        "JobTypeAddRs",
        "JobTypeRet",
      ),

    /**
     * Queries for the specified job type or set of job types.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/JobTypeQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.JobTypeQueryRq = {},
    ): Promise<NonNullable<QbdTypes.JobTypeQueryRs["JobTypeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { JobTypeQueryRq: params },
        "JobTypeQueryRs",
        "JobTypeRet",
      ),
  };

  /**
   * A journal entry is used for recording transactions directly in the general
   * journal, particularly for activities like depreciation. It requires paired
   * credit and debit lines in one request to balance the monetary amounts.
   */
  public journalEntry = {
    /**
     * The debit and credit lines can be intermingled. A credit line can legally
     * come first in the journal entry add.
     *
     * In traditional accounting, transactions are entered into the general
     * journal and categorized exclusively by account. In QuickBooks, most
     * transactions can be categorized either by account or by type (invoice,
     * check, and so on). For a few activities in QuickBooks, you must use the
     * general journal directly, for example for recording depreciation. Notice
     * that you must supply the credit line and a corresponding debit line in
     * the same request. It will not work to supply them in two distinct
     * requests. You can supply as many credit lines and debit lines in one
     * single request as you want so long as the total monetary amount from the
     * credits equals the total monetary amount from the debits in that request.
     *
     * Finally, DO NOT supply negative sign for the monetary amounts. QuickBooks
     * does that for you. If you do supply the negative sign, amounts will add
     * instead of cancel and you’ll get a runtime error.
     *
     * Querying for Condensed Transactions: If you need the query to return
     * condensed transactions, you can do this by using either an `Entity` or
     * `Account` filter in the journal query request. Alternatively, you could
     * use the The generic `TransactionQuery`, which can return condensed
     * transactions.
     *
     * If the transaction is a home currency adjustment, QuickBooks will ignore
     * the `IsAmountsEnteredInHomeCurrency`, `CurrencyRef`, and `ExchangeRate`
     * elements.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/JournalEntryAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.JournalEntryAddRq["JournalEntryAdd"],
    ): Promise<NonNullable<QbdTypes.JournalEntryAddRs["JournalEntryRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { JournalEntryAddRq: { JournalEntryAdd: params } },
        "JournalEntryAddRs",
        "JournalEntryRet",
      ),

    /**
     * Modifies a journal entry.
     *
     * If the transaction is a home currency adjustment, QuickBooks will ignore
     * the `IsAmountsEnteredInHomeCurrency`, `CurrencyRef`, and `ExchangeRate`
     * elements.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/JournalEntryMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.JournalEntryModRq["JournalEntryMod"],
    ): Promise<NonNullable<QbdTypes.JournalEntryModRs["JournalEntryRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { JournalEntryModRq: { JournalEntryMod: params } },
        "JournalEntryModRs",
        "JournalEntryRet",
      ),

    /**
     * In traditional accounting, transactions are entered into the general
     * journal and categorized exclusively by account. In QuickBooks, most
     * transactions can be categorized either by account or by type (invoice,
     * check, and so on). For a few activities in QuickBooks, you must use the
     * general journal directly, for example for recording depreciation. Notice
     * that you must supply the credit line and a corresponding debit line in
     * the same request. It will not work to supply them in two distinct
     * requests. You can supply as many credit lines and debit lines in one
     * single request as you want so long as the total monetary amount from the
     * credits equals the total monetary amount from the debits in that request.
     *
     * Finally, DO NOT supply negative sign for the monetary amounts. QuickBooks
     * does that for you. If you do supply the negative sign, amounts will add
     * instead of cancel and you’ll get a runtime error.
     *
     * Querying for Condensed Transactions: If you need the query to return
     * condensed transactions, you can do this by using either an `Entity` or
     * `Account` filter in the journal query request. Alternatively, you could
     * use the The generic `TransactionQuery`, which can return condensed
     * transactions.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/JournalEntryQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.JournalEntryQueryRq = {},
    ): Promise<NonNullable<QbdTypes.JournalEntryQueryRs["JournalEntryRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { JournalEntryQueryRq: params },
        "JournalEntryQueryRs",
        "JournalEntryRet",
      ),
  };

  /**
   * A lead is a potential customer or sales opportunity that a business might
   * have.
   */
  public lead = {
    /**
     * Adds a lead.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/LeadAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.LeadAddRq["LeadAdd"],
    ): Promise<NonNullable<QbdTypes.LeadAddRs["LeadRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { LeadAddRq: { LeadAdd: params } },
        "LeadAddRs",
        "LeadRet",
      ),

    /**
     * Modifies an existing lead.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/LeadMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.LeadModRq["LeadMod"],
    ): Promise<NonNullable<QbdTypes.LeadModRs["LeadRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { LeadModRq: { LeadMod: params } },
        "LeadModRs",
        "LeadRet",
      ),

    /**
     * Queries for the specified lead or set of leads.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/LeadQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.LeadQueryRq = {},
    ): Promise<NonNullable<QbdTypes.LeadQueryRs["LeadRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { LeadQueryRq: params },
        "LeadQueryRs",
        "LeadRet",
      ),
  };

  /**
   * A list element is a record in a list, such as an `Account`, `Customer`, or
   * `Employee`.
   */
  public listDeleted = {
    /**
     * Returns all list elements deleted within the last 90 days, grouped
     * according to object type.
     *
     * If you are synchronizing deletes, you might want to specify `ListDelType`
     * elements in order of dependency; for example, first specify a
     * `ListDelType` of `Item`, then specify a `ListDelType` of `Vendor`. This
     * way the SDK will return `Item` deletes before `Vendor` deletes (both in
     * order of real delete times). `Item` depends on (refers to) to `Vendor`,
     * so by having the `Item` deletes returned first you avoid a dependency
     * problem.
     *
     * By default, the records of each type are returned in ascending order,
     * according to the “real” delete time. For example: If list object A is
     * deleted at 10 a.m. and list object B is deleted at 11 a.m., the query
     * request will return A first, then B.
     *
     * See more:
     * https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ListDeletedQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ListDeletedQueryRq,
    ): Promise<NonNullable<QbdTypes.ListDeletedQueryRs["ListDeletedRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { ListDeletedQueryRq: params },
        "ListDeletedQueryRs",
        "ListDeletedRet",
      ),
  };

  /**
   * The “other names” list contains any names that do not appear on customer,
   * vendor, or employee lists.
   */
  public otherName = {
    /**
     * Adds an other name. In QuickBooks, the “other names” list contains any
     * names that do not appear on customer, vendor, or employee lists.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/OtherNameAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.OtherNameAddRq["OtherNameAdd"],
    ): Promise<NonNullable<QbdTypes.OtherNameAddRs["OtherNameRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { OtherNameAddRq: { OtherNameAdd: params } },
        "OtherNameAddRs",
        "OtherNameRet",
      ),

    /**
     * Modifies an existing other name.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/OtherNameMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.OtherNameModRq["OtherNameMod"],
    ): Promise<NonNullable<QbdTypes.OtherNameModRs["OtherNameRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { OtherNameModRq: { OtherNameMod: params } },
        "OtherNameModRs",
        "OtherNameRet",
      ),

    /**
     * Queries for the specified other name or set of other names.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/OtherNameQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.OtherNameQueryRq = {},
    ): Promise<NonNullable<QbdTypes.OtherNameQueryRs["OtherNameRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { OtherNameQueryRq: params },
        "OtherNameQueryRs",
        "OtherNameRet",
      ),
  };

  /**
   * A payment method is a method of payment that a business accepts, such as
   * cash, check, or credit card.
   */
  public paymentMethod = {
    /**
     * Adds a payment method, which is the way a customer pays for goods or
     * services, for example, cash, check, or Master Card.
     *
     * A `PaymentMethodRef` aggregate refers to an item on the `PaymentMethod`
     * list. In a request, if a `PaymentMethodRef` aggregate includes both
     * `FullName` and `ListID`, `FullName` will be ignored.
     *
     * In a `SalesReceiptAdd`, `ReceivePaymentAdd`, or `ARRefundCreditCard`
     * request that contains credit card transaction data supplied from QBMS
     * transaction responses, you must specify the payment method, and the
     * payment method must be a credit card type.
     *
     * See more:
     * https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PaymentMethodAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.PaymentMethodAddRq["PaymentMethodAdd"],
    ): Promise<NonNullable<QbdTypes.PaymentMethodAddRs["PaymentMethodRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { PaymentMethodAddRq: { PaymentMethodAdd: params } },
        "PaymentMethodAddRs",
        "PaymentMethodRet",
      ),

    /**
     * Queries for the specified payment method or set of payment methods.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PaymentMethodQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.PaymentMethodQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.PaymentMethodQueryRs["PaymentMethodRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { PaymentMethodQueryRq: params },
        "PaymentMethodQueryRs",
        "PaymentMethodRet",
      ),
  };

  /**
   * A payroll wage item describes and names a payment scheme, for example,
   * Regular Pay or Overtime Pay.
   */
  public payrollItemWage = {
    /**
     * Adds a payroll wage item. Each payroll wage item describes and names a
     * payment scheme, for example, Regular Pay or Overtime Pay. A
     * `PayrollItemWageRef` aggregate refers to one of these wage items. In a
     * request, if a `PayrollItemWageRef` aggregate includes both `FullName` and
     * `ListID`, `FullName` will be ignored.
     *
     * Within QuickBooks, a timesheet can specify a payroll wage item only if
     * the following criteria are met:
     * - The name on the timesheet (which corresponds to the EntityRef in the
     *   `TimeTracking` object) is on the QuickBooks Employee list, and
     * - The “Use time data to create paychecks” preference is turned on in the
     *   QuickBooks Payroll Info window that provides detailed employee
     *   information employee.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PayrollItemWageAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.PayrollItemWageAddRq["PayrollItemWageAdd"],
    ): Promise<
      NonNullable<QbdTypes.PayrollItemWageAddRs["PayrollItemWageRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { PayrollItemWageAddRq: { PayrollItemWageAdd: params } },
        "PayrollItemWageAddRs",
        "PayrollItemWageRet",
      ),

    /**
     * Queries for the specified payroll wage item or set of items.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PayrollItemWageQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.PayrollItemWageQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.PayrollItemWageQueryRs["PayrollItemWageRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { PayrollItemWageQueryRq: params },
        "PayrollItemWageQueryRs",
        "PayrollItemWageRet",
      ),
  };

  /**
   * A price level is used to specify custom pricing for specific customers.
   * Once you create a price level for a customer, QuickBooks will automatically
   * use the custom price in new invoices, sales receipts, sales orders or
   * credit memos for that customer.
   */
  public priceLevel = {
    /**
     * Adds a price level. You can use price levels to specify custom pricing
     * for specific customers.
     *
     * Once you create a price level for a customer, QuickBooks will
     * automatically use the custom price in new invoices, sales receipts, sales
     * orders or credit memos for that customer. You can override this automatic
     * feature, however, when you create the invoices, sales receipts, etc.) The
     * user can now specify a price level on line items in the following
     * supported sales transactions: invoices, sales receipts, credit memos, and
     * sales orders. Notice that the response data for the affected sales
     * transaction does not list the price level that was used. The response
     * simply lists the Rate for the item, which was set using the price level.
     * The `CurrencyRef` should only be used with “per item” price levels.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PriceLevelAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.PriceLevelAddRq["PriceLevelAdd"],
    ): Promise<NonNullable<QbdTypes.PriceLevelAddRs["PriceLevelRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { PriceLevelAddRq: { PriceLevelAdd: params } },
        "PriceLevelAddRs",
        "PriceLevelRet",
      ),

    /**
     * Modifies a price level.
     *
     * The `CurrencyRef` should only be used with “per item” price levels.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PriceLevelMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.PriceLevelModRq["PriceLevelMod"],
    ): Promise<NonNullable<QbdTypes.PriceLevelModRs["PriceLevelRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { PriceLevelModRq: { PriceLevelMod: params } },
        "PriceLevelModRs",
        "PriceLevelRet",
      ),

    /**
     * Queries for the specified price level or set of price levels.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PriceLevelQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.PriceLevelQueryRq = {},
    ): Promise<NonNullable<QbdTypes.PriceLevelQueryRs["PriceLevelRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { PriceLevelQueryRq: params },
        "PriceLevelQueryRs",
        "PriceLevelRet",
      ),
  };

  /**
   * A purchase order is an order submitted to a vendor.
   */
  public purchaseOrder = {
    /**
     * Adds a purchase order, which is an order submitted to a vendor. You can
     * use ItemReceiptAdd to receive items against a purchase order as items
     * arrive from the vendor. A purchase order is a non-posting transaction, so
     * it does not affect a company’s balance sheet or income statement.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PurchaseOrderQuery
     */
    add: async (
      endUserId: string,
      params: QbdTypes.PurchaseOrderAddRq["PurchaseOrderAdd"],
    ): Promise<NonNullable<QbdTypes.PurchaseOrderAddRs["PurchaseOrderRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { PurchaseOrderAddRq: { PurchaseOrderAdd: params } },
        "PurchaseOrderAddRs",
        "PurchaseOrderRet",
      ),

    /**
     * Modifies a purchase order.
     *
     * Some fields in a `PurchaseOrderMod` request cannot be cleared. If any of
     * the following fields is included in a purchase order modify request, it
     * must contain a value:
     * - `TemplateRef`
     * - `TxnDate`
     * - `DueDate`
     * - `ExpectedDate`
     * - `IsManuallyClosed`
     * - `IsToBePrinted`
     *
     * Within `PurchaseOrderLineMod` or `PurchaseOrderLineGroupMod`:
     * - `ItemRef`
     * - `Quantity`
     * - `Rate`
     * - `Amount`
     * - `IsManuallyClosed`
     * - `OverrideItemAccountRef`
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PurchaseOrderMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.PurchaseOrderModRq["PurchaseOrderMod"],
    ): Promise<NonNullable<QbdTypes.PurchaseOrderModRs["PurchaseOrderRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { PurchaseOrderModRq: { PurchaseOrderMod: params } },
        "PurchaseOrderModRs",
        "PurchaseOrderRet",
      ),

    /**
     * Queries for the specified purchase order or set of orders.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PurchaseOrderQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.PurchaseOrderQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.PurchaseOrderQueryRs["PurchaseOrderRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { PurchaseOrderQueryRq: params },
        "PurchaseOrderQueryRs",
        "PurchaseOrderRet",
      ),
  };

  /**
   * A receive payment transaction is used for one or more of these purposes:
   * 1. To record a customer’s payment against an invoice for one or more jobs,
   * 2. To set a discount (for early payment, for example),
   * 3. To set a credit (from previously returned merchandise, for example).
   *
   * If full payment is received at the time of sale, it is recorded using a
   * sales receipt transaction, not a receive payments transaction.
   */
  public receivePayment = {
    /**
     * Receives a customer payment into QuickBooks. A receive payment
     * transaction is used for one or more of these purposes:
     * 1. To record a customer’s payment against an invoice for one or more
     *    jobs,
     * 2. To set a discount (for early payment, for example),
     * 3. To set a credit (from previously returned merchandise, for example).
     *
     * If full payment is received at the time of sale, it is recorded using a
     * sales receipt transaction, not a receive payments transaction.
     *
     * Notice that access to sensitive data permissions are not required to use
     * this request. However, if the application does not have access to
     * sensitive data permission, then the response returned will not contain
     * certain sensitive data. For example, even if credit card data is supplied
     * in the `ReceivePaymentAdd` request via the `CreditCardTxnInfo` aggregate,
     * the response will not contain the corresponding aggregate.
     *
     * This request can be used to record QBMS credit card transaction data, via
     * the `CreditCardTxnInfo` aggregate. You can record charges and also
     * authorizations. (You can later respond to a QBMS capture of authorized
     * charges by doing a `ReceivePaymentMod` and changing the
     * `CreditCardTxnType` to “Charge”.) Notice that the reconciliation data
     * fields (`ReconBatchID`, `PaymentGroupingCode`, `PaymentStatus`,
     * `TxnAuthorizationTime`, `TxnAuthorizationStamp`, `ClientTransID`) are
     * optional ONLY if the `CreditCardTxnType` is “Authorization”. If the type
     * is “Charge”, then those reconciliation fields must be supplied or you
     * will get a runtime error.
     *
     * IMPORTANT: In a `SalesReceiptAdd` or `ReceivePaymentAdd` request that
     * contains credit card transaction data supplied from QBMS transaction
     * responses, you must specify the payment method (using the
     * `PaymentMethodRef` aggregate).
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ReceivePaymentAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.ReceivePaymentAddRq["ReceivePaymentAdd"],
    ): Promise<
      NonNullable<QbdTypes.ReceivePaymentAddRs["ReceivePaymentRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ReceivePaymentAddRq: { ReceivePaymentAdd: params } },
        "ReceivePaymentAddRs",
        "ReceivePaymentRet",
      ),

    /**
     * Modifies a receive payment transaction.
     *
     * If you save QBMS credit card data in your `ReceivePayments`, this Mod
     * request allows you to capture a previously authorized credit card charge.
     * The way this works is that the ReceivePaymentAdd would contain the QBMS
     * `CreditCardTxnInfo` aggregate with the `CreditCardTxnType` set to
     * “Authorization,” which causes QB to internally mark the transaction as
     * pending. When the capture transaction is performed later, in QBMS, that
     * capture transaction can be saved into QuickBooks via this Mod request, as
     * you are modifying the original `ReceivePayment` but changing its
     * `CreditCardTxnType` from ”Authorization” to “Capture.” This mod operation
     * results in the removal of the pending status and the posting of this
     * receive payment.
     *
     * Notice that the reconciliation data fields (`ReconBatchID`,
     * `PaymentGroupingCode`, `PaymentStatus`, `TxnAuthorizationTime`,
     * `TxnAuthorizationStamp`, `ClientTransID`) are optional ONLY if the
     * `CreditCardTxnType` is “Authorization” because authorizations don’t have
     * such data. If the type is “Charge”, then those reconciliation fields must
     * be supplied or you will get a runtime error.
     *
     * The following list describes what you can and can’t do with this request.
     * - Modify `RefNumber` or `Memo`.
     * - Modify (not clear) the `CustomerRef` field for a payment that was not
     *   electronically processed.
     * - Modify (not clear) the `ARAccountRef`.
     * - Modify (not clear) the `TxnDate`.
     * - Modify or clear the `TotalAmount`.
     * - Modify or clear the `PaymentMethodRef`.
     * - Modify, (not clear) the `DepositToAccountRef`
     * - Change the payment amount applied to an invoice. For a receive payment
     *   transaction that has been applied to several existing invoices,
     *   redistribute the payment amounts applied to the invoices.
     * - Change the discount amount applied to particular invoice.
     * - You cannot change the credit amount applied to an invoice.
     * - Apply the payment to a different invoice, including a discount and a
     *   credit. Apply the payment amount to a different invoice. Apply a
     *   discount, and a credit. The existing distribution is cleared, except
     *   for any credit that may have been applied.
     * - Modify QBMS credit card information.
     * - You cannot auto apply payment.
     * - Apply an additional credit to an invoice.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ReceivePaymentMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.ReceivePaymentModRq["ReceivePaymentMod"],
    ): Promise<
      NonNullable<QbdTypes.ReceivePaymentModRs["ReceivePaymentRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ReceivePaymentModRq: { ReceivePaymentMod: params } },
        "ReceivePaymentModRs",
        "ReceivePaymentRet",
      ),

    /**
     * Queries for the specified receive payment or set of payments.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/ReceivePaymentQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.ReceivePaymentQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.ReceivePaymentQueryRs["ReceivePaymentRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { ReceivePaymentQueryRq: params },
        "ReceivePaymentQueryRs",
        "ReceivePaymentRet",
      ),
  };

  /**
   * A report in QuickBooks Desktop is a tool that allows users to generate
   * detailed financial statements and overviews, such as Profit and Loss
   * statements or General Ledger detail reports, tailored to their specific
   * needs.
   */
  public report = {
    /**
     * Generates an aging report, which tracks outstanding invoices (in accounts
     * receivable accounts) and unpaid bills (in accounts payable accounts).
     *
     * Note that you could use a collections report instead of the aging query,
     * if that better suited your needs.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/AgingReportQuery
     */
    aging: async (
      endUserId: string,
      params: QbdTypes.AgingReportQueryRq,
    ): Promise<NonNullable<QbdTypes.AgingReportQueryRs["ReportRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { AgingReportQueryRq: params },
        "AgingReportQueryRs",
        "ReportRet",
      ),

    /**
     * Generates budget reports similar to the budget report functionality that
     * is available within the QuickBooks UI. (From the main QB menubar select
     * Reports->Budgets & Forecasts.)
     *
     * Note: the graphing functionality, forecasts, and memorized reports that
     * are available through the UI are not supported by the SDK.
     *
     * Notice that if you simply use the default instead of specifying the
     * Fiscal Year, the `ReportPeriod` defaults to “year to date.” You cannot
     * change the default to “This Fiscal Year.”
     *
     * There can only be one balance sheet budget for each fiscal year, one
     * profit and loss (P&L) by account budget per fiscal year, and one profit
     * and loss (P&L) by account and customer budget per fiscal year. Hence the
     * `FiscalYear` element is key in specifying which budget you want. Notice
     * that there are two “views” into each of the two budget categories: the
     * Overview, which shows the budget itself, and the Actual, which shows how
     * expenditures are currently running against the budget.
     *
     * All of the budget reports supported in the UI are supported in the SDK,
     * although the UI and SDK nomenclature differs slightly. The UI shows
     * Budget Overview and Budget Vs Actual as choices in the selection list,
     * with Balance Sheet and P&L as subchoices in a subsequent selection list,
     * already filtered by Accounts, or Accounts and Classes, or Accounts and
     * Customers, if these are available.
     *
     * In comparison, you choose the budget view you want via the SDK
     * `BudgetSummaryType` element, which has these possible values:
     * - `BalanceSheetBudgetOverview`
     * - `BalanceSheetBudgetVsActual`
     * - `ProfitAndLossBudgetOverview`
     * - `ProfitAndLossBudgetVsActual`
     *
     * Then you specify any additional filtering by the Budget Criterion value
     * you specify (`Accounts`, `AccountsAndCustomers`, or
     * `AccountsAndClasses`). Notice that before you can obtain a Budget report,
     * the “target” budget must be defined in QuickBooks, via the UI, because
     * you cannot create a budget via the SDK.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/BudgetSummaryReportQuery
     */
    budgetSummary: async (
      endUserId: string,
      params: QbdTypes.BudgetSummaryReportQueryRq,
    ): Promise<NonNullable<QbdTypes.BudgetSummaryReportQueryRs["ReportRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { BudgetSummaryReportQueryRq: params },
        "BudgetSummaryReportQueryRs",
        "ReportRet",
      ),

    /**
     * A Custom Transaction Detail report gives you complete control over the
     * content of the report. It does not have any default values and consists
     * entirely of customized data. You must specify all the include columns for
     * the transactions you want returned in the report.
     *
     * If you want complete control over the report content, you will be
     * interested in both the custom summary report and the custom transaction
     * detail report. Custom reports do not make any assumptions about the data
     * you are interested in–they require you to specify exactly what data you
     * want included in the report. Your application has to select the row and
     * column axes, and it controls the output using common customization
     * parameters for dates and filters. For the custom transaction detail
     * report, you must specify all the include columns for the transactions you
     * want returned in the report. For these reports, you are also required to
     * specify a date element a `DateMacro` or a custom date range).
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CustomDetailReportQuery
     */
    customDetail: async (
      endUserId: string,
      params: QbdTypes.CustomDetailReportQueryRq,
    ): Promise<NonNullable<QbdTypes.CustomDetailReportQueryRs["ReportRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CustomDetailReportQueryRq: params },
        "CustomDetailReportQueryRs",
        "ReportRet",
      ),

    /**
     * A custom summary report gives you complete control over the content of
     * the report. It does not have any default values and consists entirely of
     * customized data.
     *
     * If you want complete control over the report content, you will be
     * interested in both the custom summary report and the custom transaction
     * detail report. Custom reports do not make any assumptions about the data
     * you are interested in–they require you to specify exactly what data you
     * want included in the report. Your application has to select the row and
     * column axes, and it controls the output using common customization
     * parameters for dates and filters. For the custom transaction detail
     * report, you must specify all the include columns for the transactions you
     * want returned in the report. For these reports, you are also required to
     * specify a date element a ``DateMacro`` or a custom date range).
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/CustomSummaryReportQuery
     */
    customSummary: async (
      endUserId: string,
      params: QbdTypes.CustomSummaryReportQueryRq,
    ): Promise<NonNullable<QbdTypes.CustomSummaryReportQueryRs["ReportRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { CustomSummaryReportQueryRq: params },
        "CustomSummaryReportQueryRs",
        "ReportRet",
      ),

    /**
     * You use this report query to get any of the supported QuickBooks detail
     * reports, which you specify in the `GeneralDetailReportType`. You can
     * optionally display the report within QB by setting `DisplayReport` to
     * True.
     *
     * You can also use this detail report to get information not obtainable
     * from various SDK queries. For example, suppose you wanted the cleared
     * status from a `BillPaymentCheck`; the `BillPaymentCheckQuery` wouldn’t
     * have this info, but you could use this general detail report and specify
     * the column `ClearedStatus` to find that information.
     *
     * Also, if you wanted to query the accounts receivable directly, you could
     * do a General Detail Report Query with the report type set to Open
     * Invoices.
     *
     * You could also use this report if you needed to run a report on all
     * invoice changes made in a specific day, and only include changes to
     * invoices from a given past month, if the audit trail is on in QuickBooks.
     * You would use a `GeneralDetailReport` query with the report type set to
     * `AuditTrail`.
     *
     * Notice that if a line is paid, `PaidStatus == “X”`. If a line is not
     * paid, no entry for `PaidStatus` is returned.
     *
     * However, in the same report run within the QB GUI, the following behavior
     * is observed: This differs from the UI, where if the line is paid, an
     * entry of “Paid” is displayed and if the line is not paid, an entry of
     * “Unpaid” is displayed.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/GeneralDetailReportQuery
     */
    generalDetail: async (
      endUserId: string,
      params: QbdTypes.GeneralDetailReportQueryRq,
    ): Promise<NonNullable<QbdTypes.GeneralDetailReportQueryRs["ReportRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { GeneralDetailReportQueryRq: params },
        "GeneralDetailReportQueryRs",
        "ReportRet",
      ),

    /**
     * The General Summary Reports category is the largest category for summary
     * reports. In addition to common customizations, the reports within this
     * category can be customized by the number of columns that are returned and
     * by period comparisons for the data in the report.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/GeneralSummaryReportQuery
     */
    generalSummary: async (
      endUserId: string,
      params: QbdTypes.GeneralSummaryReportQueryRq,
    ): Promise<
      NonNullable<QbdTypes.GeneralSummaryReportQueryRs["ReportRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { GeneralSummaryReportQueryRq: params },
        "GeneralSummaryReportQueryRs",
        "ReportRet",
      ),

    /**
     * Queries for a job report, which includes both summary and transaction
     * detail reports. The reports can be customized only by date range, by
     * column summarization, and by common filters. Some job reports require a
     * `customer:job` reference in order to work.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/JobReportQuery
     */
    job: async (
      endUserId: string,
      params: QbdTypes.JobReportQueryRq,
    ): Promise<NonNullable<QbdTypes.JobReportQueryRs["ReportRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { JobReportQueryRq: params },
        "JobReportQueryRs",
        "ReportRet",
      ),

    /**
     * This report returns information from any of three QuickBooks payroll
     * reports:
     * - Payroll summary report: This report shows the total wages, taxes
     *   withheld, deductions from net pay, additions to net pay, and
     *   employer-paid taxes and contributions for each employee on the payroll.
     * - Employee earnings summary report: This report shows information similar
     *   to the payroll summary report, but in a different layout. The report
     *   has a row for each employee and a column for each payroll item.
     * - Payroll liability balances report: This report lists the payroll
     *   liabilities the QuickBooks company owes to various agencies, such as
     *   the federal government, your state government, insurance plan
     *   administrators, labor unions, etc. The report covers unpaid liabilities
     *   incurred during the period of time shown in the From and To fields. If
     *   the company paid a liability incurred within the date range of the
     *   report, the report omits that liability, even if the payment occurred
     *   after the ending date of the report.
     *
     * Payroll Summary Reports can be generated if your application is accessing
     * a company file that is currently signed up for a subscription to a
     * payroll service. (If your application is not signed up, it will receive
     * an error when it attempts to generate a report in this category.)
     *
     * The restrictions noted above about payroll reports requiring the use of
     * the Intuit Payroll service do not apply to the QuickBooks sample
     * companies. You can still test out these reports on the sample companies
     * without subscribing to the payroll service. For all other companies,
     * however, the company must be subscribed.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PayrollSummaryReportQuery
     */
    payrollSummary: async (
      endUserId: string,
      params: QbdTypes.PayrollSummaryReportQueryRq,
    ): Promise<
      NonNullable<QbdTypes.PayrollSummaryReportQueryRs["ReportRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { PayrollSummaryReportQueryRq: params },
        "PayrollSummaryReportQueryRs",
        "ReportRet",
      ),

    /**
     * Returns information from any of five QuickBooks payroll reports:
     * - Employee state taxes detail report
     * - Payroll item detail report (lists the payroll transactions on which
     *   each payroll item appears)
     * - Payroll detail review report (provides detailed information about how
     *   QuickBooks calculates tax amounts on employee paychecks and in
     *   year-to-date transactions)
     * - Payroll transaction detail report (shows the line-item detail that
     *   appears on each payroll transaction)
     * - Payroll transactions by payee report (lists payroll transactions,
     *   grouping them by payee)
     *
     * Payroll Summary Reports can be generated if your application is accessing
     * a company file that is currently signed up for a subscription to a
     * payroll service. (If your application is not signed up, it will receive
     * an error when it attempts to generate a report in this category.)
     *
     * The restrictions noted above about payroll reports requiring the use of
     * the Intuit Payroll service do not apply to the QuickBooks sample
     * companies. You can still test out these reports on the sample companies
     * without subscribing to the payroll service. For all other companies,
     * however, the company must be subscribed.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/PayrollDetailReportQuery
     */
    payrollDetail: async (
      endUserId: string,
      params: QbdTypes.PayrollDetailReportQueryRq,
    ): Promise<NonNullable<QbdTypes.PayrollDetailReportQueryRs["ReportRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { PayrollDetailReportQueryRq: params },
        "PayrollDetailReportQueryRs",
        "ReportRet",
      ),

    /**
     * The Time Reports category includes summary and detail reports related by
     * time. Summarized columns can be customized in these reports.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TimeReportQuery
     */
    time: async (
      endUserId: string,
      params: QbdTypes.TimeReportQueryRq,
    ): Promise<NonNullable<QbdTypes.TimeReportQueryRs["ReportRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { TimeReportQueryRq: params },
        "TimeReportQueryRs",
        "ReportRet",
      ),
  };

  /**
   * A sales order tracks inventory that is on back order for a customer. In
   * QuickBooks, sales orders and invoices use similar fields, and a sales order
   * can be “converted” into an invoice (by linking the invoice to the sales
   * order) once the inventory is in stock.
   */
  public salesOrder = {
    /**
     * Adds a sales order.
     *
     * A sales order tracks inventory that is on back order for a customer. In
     * QuickBooks, sales orders and invoices use similar fields, and a sales
     * order can be “converted” into an invoice (by linking the invoice to the
     * sales order) once the inventory is in stock.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesOrderAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.SalesOrderAddRq["SalesOrderAdd"],
    ): Promise<NonNullable<QbdTypes.SalesOrderAddRs["SalesOrderRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesOrderAddRq: { SalesOrderAdd: params } },
        "SalesOrderAddRs",
        "SalesOrderRet",
      ),

    /**
     * Modifies a sales order.
     *
     * Some fields in a `SalesOrderMod` request cannot be cleared. If any of the
     * following fields is included in a sales-order modify request, it must
     * contain a value:
     * - `CustomerRef`
     * - `TemplateRef`
     * - `TxnDate`
     * - `DueDate`
     * - `ShipDate`
     * - `ItemSalesTaxRef`
     * - `IsManuallyClosed`
     * - `IsToBePrinted`
     *
     * Within `SalesOrderLineMod` or `SalesOrderLineGroupMod`:
     * - `ItemRef`
     * - `Quantity`
     * - `Rate`
     * - `Amount`
     * - `SalesTaxCodeRef`
     * - `IsManuallyClosed`
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesOrderMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.SalesOrderModRq["SalesOrderMod"],
    ): Promise<NonNullable<QbdTypes.SalesOrderModRs["SalesOrderRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesOrderModRq: { SalesOrderMod: params } },
        "SalesOrderModRs",
        "SalesOrderRet",
      ),

    /**
     * Queries for the specified sales order or set of sales orders.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesOrderQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.SalesOrderQueryRq = {},
    ): Promise<NonNullable<QbdTypes.SalesOrderQueryRs["SalesOrderRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesOrderQueryRq: params },
        "SalesOrderQueryRs",
        "SalesOrderRet",
      ),
  };

  /**
   * Sales receipts include payments by cash, check, or credit card.
   */
  public salesReceipt = {
    /**
     * Adds a sales receipt to QuickBooks.
     *
     * Notice that access to sensitive data permissions are not required to use
     * this request. However, if the application does not have access to
     * sensitive data permission, then the response returned will not contain
     * certain sensitive data. For example, even if credit card data is supplied
     * in the `SalesReceiptAdd` request via the `CreditCardTxnInfo` aggregate,
     * the response will not contain the corresponding aggregate.
     *
     * Sales receipts are used to record point-of-sale payments. Sales receipts
     * include payments by cash, check, or credit card. Note: If full payment is
     * not received at the time of the sale, do not use a sales receipt.
     * Instead, use an invoice transaction and record the partial payment using
     * a payment item.
     *
     * IMPORTANT: In a `SalesReceiptAdd` or `ReceivePaymentAdd` request that
     * contains credit card transaction data supplied from QBMS transaction
     * responses, you must specify the payment method (using the
     * `PaymentMethodRef` aggregate).
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesReceiptAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.SalesReceiptAddRq["SalesReceiptAdd"],
    ): Promise<NonNullable<QbdTypes.SalesReceiptAddRs["SalesReceiptRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesReceiptAddRq: { SalesReceiptAdd: params } },
        "SalesReceiptAddRs",
        "SalesReceiptRet",
      ),

    /**
     * Modifies an existing Sales receipt.
     *
     * IMPORTANT: In a `SalesReceiptMod` request that contains credit card
     * transaction data supplied from QBMS transaction responses, you cannot
     * change the total amount recorded in the sale.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesReceiptMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.SalesReceiptModRq["SalesReceiptMod"],
    ): Promise<NonNullable<QbdTypes.SalesReceiptModRs["SalesReceiptRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesReceiptModRq: { SalesReceiptMod: params } },
        "SalesReceiptModRs",
        "SalesReceiptRet",
      ),

    /**
     * Queries for the specified sales receipt or set of receipts.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesReceiptQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.SalesReceiptQueryRq = {},
    ): Promise<NonNullable<QbdTypes.SalesReceiptQueryRs["SalesReceiptRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesReceiptQueryRq: params },
        "SalesReceiptQueryRs",
        "SalesReceiptRet",
      ),
  };

  /**
   * A sales rep is a sales representative listed on sales forms.
   */
  public salesRep = {
    /**
     * Adds a sales rep.
     *
     * The sales representative must be on the Employee, Vendor, or Other Names
     * list within QuickBooks. Sales representative’s names and initials appear
     * on the Rep drop-down list on QuickBooks sales forms.
     *
     * A `SalesRepRef` refers to a person on the `SalesRep` list. In a request,
     * if a `SalesRepRef` aggregate includes both `FullName` and `ListID`,
     * `FullName` will be ignored.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesRepAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.SalesRepAddRq["SalesRepAdd"],
    ): Promise<NonNullable<QbdTypes.SalesRepAddRs["SalesRepRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesRepAddRq: { SalesRepAdd: params } },
        "SalesRepAddRs",
        "SalesRepRet",
      ),

    /**
     * Modifies a sales rep record.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesRepMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.SalesRepModRq["SalesRepMod"],
    ): Promise<NonNullable<QbdTypes.SalesRepModRs["SalesRepRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesRepModRq: { SalesRepMod: params } },
        "SalesRepModRs",
        "SalesRepRet",
      ),

    /**
     * Queries for the specified sales rep or set of reps.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesRepQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.SalesRepQueryRq = {},
    ): Promise<NonNullable<QbdTypes.SalesRepQueryRs["SalesRepRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesRepQueryRq: params },
        "SalesRepQueryRs",
        "SalesRepRet",
      ),
  };

  /**
   * A sales tax code helps categorize items on a sales form as taxable or
   * non-taxable, detailing reasons and associating tax codes with customers,
   * items, or transactions.
   */
  public salesTaxCode = {
    /**
     * Adds a sales tax code.
     *
     * Each item on a sales form is assigned a sales-tax code that indicates
     * whether the item is taxable or non-taxable, and why. Two general codes,
     * which can be modified but not deleted, appear on the sales-tax code list
     * by default:
     * - Non-taxable `(Name = NON; Desc = Non-Taxable; IsTaxable = false)`
     * - Taxable `(Name = TAX; Desc = Taxable; IsTaxable = true)`
     *
     * A sales-tax code can be deleted only if it is no longer associated with
     * any customer, item, or transaction. If the “Do You Charge Sales Tax?”
     * preference within QuickBooks is set to No, QuickBooks will assign the
     * default non-taxable sales-tax code to all sales.
     *
     * A `SalesTaxCodeRef` aggregate refers to a sales-tax code on the list. In
     * a request, if a `SalesTaxCodeRef` aggregate includes both `FullName` and
     * `ListID`, `FullName` will be ignored. In a Customer message,
     * `SalesTaxCodeRef` refers to the sales-tax code that will be used for
     * items related to this customer. In an ItemInventory message,
     * `SalesTaxCodeRef` refers to the type of sales tax that will be charged
     * for this item, if it is a taxable item and if sales tax is set up within
     * QuickBooks.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesTaxCodeAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.SalesTaxCodeAddRq["SalesTaxCodeAdd"],
    ): Promise<NonNullable<QbdTypes.SalesTaxCodeAddRs["SalesTaxCodeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesTaxCodeAddRq: { SalesTaxCodeAdd: params } },
        "SalesTaxCodeAddRs",
        "SalesTaxCodeRet",
      ),

    /**
     * Modifies the specified sales tax code, subject to a few limitations. You
     * cannot use it to change a tax code’s `IsTaxable` property after the code
     * has been used in any transaction. For the default QuickBooks taxable
     * (Tax) and exempt (Non) tax codes, you can’t use this request to change
     * the `IsTaxable` property at all, even before any transactions.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesTaxCodeMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.SalesTaxCodeModRq["SalesTaxCodeMod"],
    ): Promise<NonNullable<QbdTypes.SalesTaxCodeModRs["SalesTaxCodeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesTaxCodeModRq: { SalesTaxCodeMod: params } },
        "SalesTaxCodeModRs",
        "SalesTaxCodeRet",
      ),

    /**
     * Queries for the specified sales tax code or set of codes.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesTaxCodeQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.SalesTaxCodeQueryRq = {},
    ): Promise<NonNullable<QbdTypes.SalesTaxCodeQueryRs["SalesTaxCodeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { SalesTaxCodeQueryRq: params },
        "SalesTaxCodeQueryRs",
        "SalesTaxCodeRet",
      ),
  };

  /**
   * A sales tax payment check is a payment made for sales tax owed (for
   * example, to a state sales tax authority).
   */
  public salesTaxPaymentCheck = {
    /**
     * Adds a payment made for sales tax owed (for example, to a state sales tax
     * authority).
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesTaxPaymentCheckAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.SalesTaxPaymentCheckAddRq["SalesTaxPaymentCheckAdd"],
    ): Promise<
      NonNullable<QbdTypes.SalesTaxPaymentCheckAddRs["SalesTaxPaymentCheckRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { SalesTaxPaymentCheckAddRq: { SalesTaxPaymentCheckAdd: params } },
        "SalesTaxPaymentCheckAddRs",
        "SalesTaxPaymentCheckRet",
      ),

    /**
     * Modifies an existing sales tax payment check.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesTaxPaymentCheckMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.SalesTaxPaymentCheckModRq["SalesTaxPaymentCheckMod"],
    ): Promise<
      NonNullable<QbdTypes.SalesTaxPaymentCheckModRs["SalesTaxPaymentCheckRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { SalesTaxPaymentCheckModRq: { SalesTaxPaymentCheckMod: params } },
        "SalesTaxPaymentCheckModRs",
        "SalesTaxPaymentCheckRet",
      ),

    /**
     * Queries for payments that have been made for sales tax owed (for example,
     * to a state sales tax authority).
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/SalesTaxPaymentCheckQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.SalesTaxPaymentCheckQueryRq = {},
    ): Promise<
      NonNullable<
        QbdTypes.SalesTaxPaymentCheckQueryRs["SalesTaxPaymentCheckRet"]
      >
    > =>
      this.sendRequestWrapper(
        endUserId,
        { SalesTaxPaymentCheckQueryRq: params },
        "SalesTaxPaymentCheckQueryRs",
        "SalesTaxPaymentCheckRet",
      ),
  };

  /**
   * Standard terms show the number of days within which payment is due and can
   * include a discount for early payment. Payments with date-driven terms, on
   * the other hand, are due by a certain date.
   */
  public standardTerms = {
    /**
     * Adds a standard term. Standard terms show the number of days within which
     * payment is due and can include a discount for early payment. For example,
     * the following standard term means that payment is due in 30 days, with a
     * 1% discount if payment is made within 10 days: "1% 10 Net 30".
     *
     * Payments with date-driven terms, on the other hand, are due by a certain
     * date.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/StandardTermsAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.StandardTermsAddRq["StandardTermsAdd"],
    ): Promise<NonNullable<QbdTypes.StandardTermsAddRs["StandardTermsRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { StandardTermsAddRq: { StandardTermsAdd: params } },
        "StandardTermsAddRs",
        "StandardTermsRet",
      ),

    /**
     * Queries for the specified standard term or set of terms.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/StandardTermsQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.StandardTermsQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.StandardTermsQueryRs["StandardTermsRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { StandardTermsQueryRq: params },
        "StandardTermsQueryRs",
        "StandardTermsRet",
      ),
  };

  /**
   * The time-tracking object facilitates payroll and invoicing based on work
   * hours, assignable to vendors, employees, or others.
   */
  public timeTracking = {
    /**
     * This request adds a time tracking transaction to QuickBooks, mirroring
     * the time-tracking feature available in the QuickBooks UI. The time
     * tracking feature allows a QuickBooks user to base payroll or invoices on
     * time worked. You can add time-tracking information to any vendor,
     * employee, or person on the Other Names list in QuickBooks.
     *
     * If `IsBillable` is set to true, both `CustomerRef` and `ItemServiceRef`
     * are required. There is no link between an invoice and the time entries.
     * However, when you do the invoicing from QuickBooks, QuickBooks does mark
     * the time entries as “billed.” If you don’t record the time entries as
     * billed properly, then you get into a user workflow issue where every time
     * the user creates an invoice for a customer, QB pops up a dialog asking if
     * they want to bill the un-billed time (which you already billed from your
     * app).
     *
     * See more:
     * https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TimeTrackingAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.TimeTrackingAddRq["TimeTrackingAdd"],
    ): Promise<NonNullable<QbdTypes.TimeTrackingAddRs["TimeTrackingRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { TimeTrackingAddRq: { TimeTrackingAdd: params } },
        "TimeTrackingAddRs",
        "TimeTrackingRet",
      ),

    /**
     * Modifies a time tracking transaction.
     *
     * This allows you to modify time entry and mark time entered as billed.
     * Applications using qbXML spec levels less than 6.0 aren’t able to Modify
     * a time tracking transaction. However, those applications can achieve the
     * results of a modify operation by deleting the time tracking transaction
     * (using `TxnDelRq`) and then re-adding it with the desired values. You can
     * do this only if no other downstream transactions have used that
     * particular time tracking transaction. (Otherwise, the `TxnDel` request
     * will fail.) This differs slightly from the UI, which allows these
     * transactions to be edited directly. However, even in the UI, modifying a
     * time tracking transaction does not result in changes to any downstream
     * transactions that use it. There is no link between an invoice and the
     * time entries. However when you do the invoicing from QuickBooks,
     * QuickBooks does mark the time entries as “billed.” If you don’t record
     * the time entries as billed properly, then you get into a user workflow
     * issue where every time the user creates an invoice for a customer, QB
     * pops up a dialog asking if they want to bill the un-billed time (which
     * you already billed from your app). That’s why beginning with QB2007 and
     * qbXML spec 6.0 we added support for the “BillableStatus” field *and* add
     * `TimeTrackingMod` so that you can mark the time as billed when you create
     * an invoice for it.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TimeTrackingMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.TimeTrackingModRq["TimeTrackingMod"],
    ): Promise<NonNullable<QbdTypes.TimeTrackingModRs["TimeTrackingRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { TimeTrackingModRq: { TimeTrackingMod: params } },
        "TimeTrackingModRs",
        "TimeTrackingRet",
      ),

    /**
     * The time-tracking transactions that are returned in this query include
     * time tracking information that was entered into QuickBooks manually or
     * gathered using the QuickBooks “Timer” or “Stopwatch.” Note that the
     * QuickBooks Timer application can run on its own without QuickBooks, but
     * the QuickBooks SDK cannot access the Timer data directly. The Timer data
     * must be imported into QuickBooks before it is accessible via the SDK.)
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TimeTrackingQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.TimeTrackingQueryRq = {},
    ): Promise<NonNullable<QbdTypes.TimeTrackingQueryRs["TimeTrackingRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { TimeTrackingQueryRq: params },
        "TimeTrackingQueryRs",
        "TimeTrackingRet",
      ),
  };

  /**
   * A general transaction is a superset of all transaction types in QuickBooks
   * Desktop.
   */
  public transaction = {
    /**
     * Queries for transactions across different transaction types. In contrast
     * to the other transaction-specific queries, this query only returns data
     * common to all transactions, such as `TxnID`, type, dates, accountRef, and
     * so on. This query does return condensed transactions.
     *
     * Accordingly, if additional and more transaction-specific data is
     * required, a subsequent call to the desired query can be used to get that
     * transaction-specific data. For example, this method can be used to
     * present all transactions in a certain date range, then the user can
     * select a particular transaction, say an invoice transaction. In response
     * to this choice, you could do an `InvoiceQuery` to pull up all of the
     * invoice data.
     *
     * You should be aware that permissions are obeyed in this query. So, if you
     * set the transaction type filter to “All” (or if you don’t set it at all),
     * the query will be searching only those transaction types that are
     * permissible types for the user currently logged in. Accordingly, if
     * instead of “all,” you specify a transaction type that the currently
     * logged in user is not permitted to access, you will get a runtime error,
     * even if other permissible transaction types were specified as well.
     *
     * Finally, the transaction query is subject to sensitive data access level
     * restrictions and payroll subscription status.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TransactionQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.TransactionQueryRq = {},
    ): Promise<NonNullable<QbdTypes.TransactionQueryRs["TransactionRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { TransactionQueryRq: params },
        "TransactionQueryRs",
        "TransactionRet",
      ),

    /**
     * Deleting a transaction removes it completely and irreversibly. (Using a
     * `TxnVoid` request to void a transaction, on the other hand, sets its
     * amount to zero but keeps a record of it in QuickBooks.)
     *
     * If you try to delete or void a transaction while it is in use, you will
     * get an error. You will also get an error if you try to delete or void a
     * transaction (say a sales receipt) while a linked transaction (such as a
     * deposit) is in use. If you try to delete or void a transaction that was
     * created before the company’s closing date, you might or might not get an
     * error, depending on the permissions and passwords that are set in
     * QuickBooks.
     *
     * The mode in which a QuickBooks company file is open (single-user or
     * multi-user) does not impact your application’s ability to delete
     * transaction objects from it. (List objects can only be deleted if the
     * company file is open in single-user mode.)
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TxnDel
     */
    delete: async (
      endUserId: string,
      params: QbdTypes.TxnDelRq,
    ): Promise<NonNullable<QbdTypes.TxnDelRs>> =>
      // Call `this.sendRequest()` instead of `this.sendRequestWrapper()`
      // because `TxnDel` has a unique input and output structure.
      this.sendRequest(endUserId, "quickbooks_desktop", {
        TxnDelRq: params,
      }) as Promise<QbdTypes.TxnDelRs>,

    /**
     * Voiding a transaction sets its amount to zero but keeps a record of it in
     * QuickBooks. (Using `TxnDel` to delete a transaction, on the other hand,
     * removes the transaction completely.)
     *
     * If you try to void or delete a transaction while it is in use, you will
     * get an error. You will also get an error if you try to void or delete a
     * transaction (say a sales receipt) while a linked transaction (such as a
     * deposit) is in use. If you try to void or delete a transaction that was
     * created before the company’s closing date, you might or might not get an
     * error, depending on the permissions and passwords that are set in
     * QuickBooks.
     *
     * The mode in which a QuickBooks company file is open (single-user or
     * multi-user) does not impact your application’s ability to void
     * transaction objects in it.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TxnVoid
     */
    void: async (
      endUserId: string,
      params: QbdTypes.TxnVoidRq,
    ): Promise<NonNullable<QbdTypes.TxnVoidRs>> =>
      // Call `this.sendRequest()` instead of `this.sendRequestWrapper()`
      // because `TxnVoid` has a unique input and output structure.
      this.sendRequest(endUserId, "quickbooks_desktop", {
        TxnVoidRq: params,
      }) as Promise<QbdTypes.TxnVoidRs>,
  };

  /**
   * A transfer is a transaction that moves money from one account to another
   * account.
   */
  public transfer = {
    /**
     * Adds a transfer transaction.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TransferAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.TransferAddRq["TransferAdd"],
    ): Promise<NonNullable<QbdTypes.TransferAddRs["TransferRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { TransferAddRq: { TransferAdd: params } },
        "TransferAddRs",
        "TransferRet",
      ),

    /**
     * Modifies a transfer transaction.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TransferMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.TransferModRq["TransferMod"],
    ): Promise<NonNullable<QbdTypes.TransferModRs["TransferRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { TransferModRq: { TransferMod: params } },
        "TransferModRs",
        "TransferRet",
      ),

    /**
     * Queries for the specified transfer or set of transfers.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TransferQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.TransferQueryRq = {},
    ): Promise<NonNullable<QbdTypes.TransferQueryRs["TransferRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { TransferQueryRq: params },
        "TransferQueryRs",
        "TransferRet",
      ),
  };

  /**
   * An inventory transfer is the movement of inventory between two inventory
   * sites.
   */
  public transferInventory = {
    /**
     * Adds a transfer inventory transaction.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TransferInventoryAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.TransferInventoryAddRq["TransferInventoryAdd"],
    ): Promise<
      NonNullable<QbdTypes.TransferInventoryAddRs["TransferInventoryRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { TransferInventoryAddRq: { TransferInventoryAdd: params } },
        "TransferInventoryAddRs",
        "TransferInventoryRet",
      ),

    /**
     * Modifies a transfer inventory transaction.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TransferInventoryMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.TransferInventoryModRq["TransferInventoryMod"],
    ): Promise<
      NonNullable<QbdTypes.TransferInventoryModRs["TransferInventoryRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { TransferInventoryModRq: { TransferInventoryMod: params } },
        "TransferInventoryModRs",
        "TransferInventoryRet",
      ),

    /**
     * Queries for the specified transfer inventory transaction or set of
     * transfer inventory transactions.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TransferInventoryQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.TransferInventoryQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.TransferInventoryQueryRs["TransferInventoryRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { TransferInventoryQueryRq: params },
        "TransferInventoryQueryRs",
        "TransferInventoryRet",
      ),
  };

  /**
   * Query deleted transaction elements, such as invoices, bills, and checks.
   */
  public txnDeleted = {
    /**
     * Returns all transaction elements deleted within the last 90 days, grouped
     * according to object type.
     *
     * For example, if the request specifies `TxnDelType` elements of `Bill` and
     * then `Check`, it will return all the `Bill` deletes first, then all the
     * `Check` deletes.
     *
     * By default, the records are returned in ascending order, according to the
     * “real” delete time. For example:
     * - If transaction A is deleted at 10 a.m. and B is deleted at 11 a.m., the
     *   query request will return A first, then B.
     * - However, if the QuickBooks user moves the clock back before deleting B
     *   (for example, B is deleted at 9 a.m.), the query will still return
     *   first A then B, because B was deleted after A in “real” time.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/TxnDeletedQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.TxnDeletedQueryRq,
    ): Promise<NonNullable<QbdTypes.TxnDeletedQueryRs["TxnDeletedRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { TxnDeletedQueryRq: params },
        "TxnDeletedQueryRs",
        "TxnDeletedRet",
      ),
  };

  /**
   * A vehicle is used to add, select, and manage vehicles for tracking and
   * billing mileage.
   */
  public vehicle = {
    /**
     * Adds a vehicle to the vehicle list for use in `VehicleMileage`
     * transactions. Each vehicle name must be unique.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VehicleAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.VehicleAddRq["VehicleAdd"],
    ): Promise<NonNullable<QbdTypes.VehicleAddRs["VehicleRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VehicleAddRq: { VehicleAdd: params } },
        "VehicleAddRs",
        "VehicleRet",
      ),

    /**
     * Modifies a vehicle already in the vehicle list. Any modification,
     * including changing the name, will cause corresponding changes in existing
     * `VehicleMileage` transactions and in reports.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VehicleMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.VehicleModRq["VehicleMod"],
    ): Promise<NonNullable<QbdTypes.VehicleModRs["VehicleRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VehicleModRq: { VehicleMod: params } },
        "VehicleModRs",
        "VehicleRet",
      ),

    /**
     * Queries for the specified vehicle or set of vehicles.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VehicleQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.VehicleQueryRq = {},
    ): Promise<NonNullable<QbdTypes.VehicleQueryRs["VehicleRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VehicleQueryRq: params },
        "VehicleQueryRs",
        "VehicleRet",
      ),
  };

  /**
   * Vehicle mileage records a mileage transaction for a specified vehicle,
   * using provided or calculated miles.
   */
  public vehicleMileage = {
    /**
     * Adds a vehicle mileage transaction. involving the specified vehicle for
     * the specified total miles or optionally for the QuickBooks calculated
     * total miles if you supply the odometer start and end.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VehicleMileageAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.VehicleMileageAddRq["VehicleMileageAdd"],
    ): Promise<
      NonNullable<QbdTypes.VehicleMileageAddRs["VehicleMileageRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { VehicleMileageAddRq: { VehicleMileageAdd: params } },
        "VehicleMileageAddRs",
        "VehicleMileageRet",
      ),

    /**
     * Queries for the specified vehicle mileage transaction or set of vehicle
     * mileage transactions.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VehicleMileageQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.VehicleMileageQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.VehicleMileageQueryRs["VehicleMileageRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { VehicleMileageQueryRq: params },
        "VehicleMileageQueryRs",
        "VehicleMileageRet",
      ),
  };

  /**
   * A vendor is any person or company from whom a small business owner buys
   * goods and services. (Banks and tax agencies usually are included on the
   * vendor list.) A company’s vendor list contains information such as account
   * balance and contact information about each vendor.
   */
  public vendor = {
    /**
     * Adds a vendor.
     *
     * A vendor is any person or company from whom a small business owner buys
     * goods and services. (Banks and tax agencies usually are included on the
     * vendor list.) A company’s vendor list contains information such as
     * account balance and contact information about each vendor. A `VendorRef`
     * aggregate refers to one of the vendors on the list. In a request, if a
     * `VendorRef` aggregate includes both `FullName` and `ListID`, `FullName`
     * will be ignored.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VendorAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.VendorAddRq["VendorAdd"],
    ): Promise<NonNullable<QbdTypes.VendorAddRs["VendorRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VendorAddRq: { VendorAdd: params } },
        "VendorAddRs",
        "VendorRet",
      ),

    /**
     * Modifies a vendor.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VendorMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.VendorModRq["VendorMod"],
    ): Promise<NonNullable<QbdTypes.VendorModRs["VendorRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VendorModRq: { VendorMod: params } },
        "VendorModRs",
        "VendorRet",
      ),

    /**
     * Queries for the specified vendor or set of vendors.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VendorQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.VendorQueryRq = {},
    ): Promise<NonNullable<QbdTypes.VendorQueryRs["VendorRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VendorQueryRq: params },
        "VendorQueryRs",
        "VendorRet",
      ),
  };

  /**
   * A vendor credit is also known as a “bill credit”. That is, it is a credit
   * that a vendor owes you because you overpaid your bill, returned
   * merchandise, or for some other reason.
   */
  public vendorCredit = {
    /**
     * Adds a vendor credit.
     *
     * A vendor credit is also known as a “bill credit”. That is, it is a credit
     * that a vendor owes you because you overpaid your bill, returned
     * merchandise, or for some other reason. The `VendorCredit` is referenced
     * in a BilPayment transaction, inside the `SetCredit` aggregate.
     *
     * A `VendorCredit` should not be confused with a Credit Memo, which is
     * something you owe your customer and which is referenced in a
     * `ReceivePayment` request.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VendorCreditAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.VendorCreditAddRq["VendorCreditAdd"],
    ): Promise<NonNullable<QbdTypes.VendorCreditAddRs["VendorCreditRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VendorCreditAddRq: { VendorCreditAdd: params } },
        "VendorCreditAddRs",
        "VendorCreditRet",
      ),

    /**
     * Modifies a vendor credit. Be careful! If you modify ANY line item, you
     * must fully re-construct the line item table as you want it because if you
     * edit even a single line item, any line item that is NOT in the vendor
     * credit mod will be omitted. For full details, see the QB SDK Programmer’s
     * Guide chapter on modifying and deleting transactions and list objects.
     *
     * A vendor credit is also known as a “bill credit”. That is, it is a credit
     * that a vendor owes you because you overpaid your bill, returned
     * merchandise, or for some other reason. The `VendorCredit` is referenced
     * in a BilPayment transaction, inside the `SetCredit` aggregate.
     *
     * A `VendorCredit` should not be confused with a Credit Memo, which is
     * something you owe your customer and which is referenced in a
     * `ReceivePayment` request.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VendorCreditMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.VendorCreditModRq["VendorCreditMod"],
    ): Promise<NonNullable<QbdTypes.VendorCreditModRs["VendorCreditRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VendorCreditModRq: { VendorCreditMod: params } },
        "VendorCreditModRs",
        "VendorCreditRet",
      ),

    /**
     * Queries for the specified vendor credit or set of credits.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VendorCreditQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.VendorCreditQueryRq = {},
    ): Promise<NonNullable<QbdTypes.VendorCreditQueryRs["VendorCreditRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VendorCreditQueryRq: params },
        "VendorCreditQueryRs",
        "VendorCreditRet",
      ),
  };

  /**
   * A vendor type allows business owners to categorize vendors in ways that are
   * meaningful for their businesses. For example, a vendor type might indicate
   * which industry a vendor represents, or which part of the country a vendor
   * is in.
   */
  public vendorType = {
    /**
     * Adds a vendor type. A vendor type allows business owners to categorize
     * vendors in ways that are meaningful for their businesses. For example, a
     * vendor type might indicate which industry a vendor represents, or which
     * part of the country a vendor is in.
     *
     * A `VendorTypeRef` aggregate refers to one of the types on the
     * `VendorType` list. In a request, if a `VendorTypeRef` aggregate includes
     * both `FullName` and `ListID`, `FullName` will be ignored.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VendorTypeAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.VendorTypeAddRq["VendorTypeAdd"],
    ): Promise<NonNullable<QbdTypes.VendorTypeAddRs["VendorTypeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VendorTypeAddRq: { VendorTypeAdd: params } },
        "VendorTypeAddRs",
        "VendorTypeRet",
      ),

    /**
     * Queries for the specified vendor type or set of types.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/VendorTypeQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.VendorTypeQueryRq = {},
    ): Promise<NonNullable<QbdTypes.VendorTypeQueryRs["VendorTypeRet"]>> =>
      this.sendRequestWrapper(
        endUserId,
        { VendorTypeQueryRq: params },
        "VendorTypeQueryRs",
        "VendorTypeRet",
      ),
  };

  /**
   * A workers comp code categorizes occupations based on risk, determining
   * insurance premiums for workers' compensation coverage.
   */
  public workersCompCode = {
    /**
     * Adds a workers’ compensation code with one or more rate entries (each
     * rate entry has an effective date and a rate). You can assign effective
     * dates in the past, present or future. However, only one future date will
     * be used. If a future date exists and you write a new one (using the Mod
     * request) then the most recently written code wins; if you have multiple
     * future dates in the Add request, the last one wins.
     *
     * This request requires the company to be subscribed to Intuit Payroll
     * service. Also, you cannot currently assign codes to employees in the SDK;
     * you have to use the UI to do that.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/WorkersCompCodeAdd
     */
    add: async (
      endUserId: string,
      params: QbdTypes.WorkersCompCodeAddRq["WorkersCompCodeAdd"],
    ): Promise<
      NonNullable<QbdTypes.WorkersCompCodeAddRs["WorkersCompCodeRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { WorkersCompCodeAddRq: { WorkersCompCodeAdd: params } },
        "WorkersCompCodeAddRs",
        "WorkersCompCodeRet",
      ),

    /**
     * Modifies an existing workers’ compensation code. Notice that if a future
     * date exists and you write a new one (using the Mod request) then the most
     * recently written code wins.
     *
     * This request requires the company to be subscribed to Intuit Payroll
     * service. Also, you cannot currently assign codes to employees in the SDK;
     * you have to use the UI to do that.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/WorkersCompCodeMod
     */
    mod: async (
      endUserId: string,
      params: QbdTypes.WorkersCompCodeModRq["WorkersCompCodeMod"],
    ): Promise<
      NonNullable<QbdTypes.WorkersCompCodeModRs["WorkersCompCodeRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { WorkersCompCodeModRq: { WorkersCompCodeMod: params } },
        "WorkersCompCodeModRs",
        "WorkersCompCodeRet",
      ),

    /**
     * Queries for the workers’ compensation codes specified in the query
     * filter; you can filter by name, modified date, and effective date.
     *
     * This request requires the company to be subscribed to Intuit Payroll
     * service.
     *
     * See more: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference/qbdesktop/WorkersCompCodeQuery
     */
    query: async (
      endUserId: string,
      params: QbdTypes.WorkersCompCodeQueryRq = {},
    ): Promise<
      NonNullable<QbdTypes.WorkersCompCodeQueryRs["WorkersCompCodeRet"]>
    > =>
      this.sendRequestWrapper(
        endUserId,
        { WorkersCompCodeQueryRq: params },
        "WorkersCompCodeQueryRs",
        "WorkersCompCodeRet",
      ),
  };

  private async sendRequestWrapper<R>(
    endUserId: string,
    params: Record<string, unknown>,
    responseWrapperKey: string,
    responseBodyKey: string,
  ): Promise<R> {
    const response = (await this.sendRequest(
      endUserId,
      "quickbooks_desktop",
      params,
    )) as Record<string, Record<string, R>>;
    const responseBody = response[responseWrapperKey]?.[responseBodyKey];
    if (responseBody === undefined) {
      throw new ConductorIntegrationError({
        message: "No response received from QuickBooks Desktop.",
        userFacingMessage: "No response received from QuickBooks Desktop.",
        code: "QBD_NO_RESPONSE",
      });
    }
    return responseBody;
  }
}
