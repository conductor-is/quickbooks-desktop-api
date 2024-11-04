<!-- markdownlint-disable MD033 MD041 -->
<div align="center">
  <a href="https://conductor.is">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/conductor-is/quickbooks-desktop-api/assets/170023/162ee6a9-75ac-41e9-9f1e-2ecc1d88f841">
      <img alt="Conductor logo" src="https://github.com/conductor-is/quickbooks-desktop-api/assets/170023/d67464b8-53a7-4d33-afeb-05a2efde1fa8" width="325">
    </picture>
  </a>
  <h3>QuickBooks Desktop API for Python, Node.js, TypeScript, and REST</h3>
  <a href="https://docs.conductor.is/overview/quickstart">Quickstart</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://conductor.is">Website</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://docs.conductor.is">Docs</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://docs.conductor.is/qbd-examples">Examples</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/conductor_is">Twitter</a>
  <br />
  <br />
  <a href="https://npmjs.com/package/conductor-node"><img src="https://img.shields.io/npm/dm/conductor-node.svg?logo=npm" alt="NPM download count"></a>
  <a href="https://npmjs.org/package/conductor-node"><img src="https://img.shields.io/npm/v/conductor-node.svg?logo=npm" alt="Package version"></a>
  <img src="https://img.shields.io/badge/coverage-100%25-brightgreen" alt="Code coverage">
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/conductor-node.svg?color=blue&logo=github" alt="License" /></a>
  <hr />
</div>

## What is Conductor?

Conductor is a real-time, fully-typed API for **QuickBooks Desktop** (sometimes called QuickBooks Enterprise), available via Python, Node.js, TypeScript, and REST. In just a few lines, get real-time access to fetch, create, or update [_any_ QuickBooks Desktop object type](https://docs.conductor.is/qbd/api#supported-object-types) and receive a fully-typed response. Check out [the documentation](https://docs.conductor.is) to get started.

Conductor, the company, is building a data integration platform for vertical SaaS companies, starting with QuickBooks Desktop. Our team has spent over a decade building companies, scaling vast software systems, and obsessing over quality.

<!-- markdownlint-disable MD033 -->
<div align="center">
  <a href="https://docs.conductor.is"><img src="https://user-images.githubusercontent.com/170023/213273732-83dd6881-0b36-4787-820b-bd55cdc8444f.jpg" alt="QuickBooks Desktop autocomplete" width="600" style="border-radius: 20px;" /></a>
</div>

## Key features

- **Any data type:** Query, create, or update any QuickBooks Desktop data type.
- **Real-time**: Get real-time updates on your QuickBooks Desktop data. No queues, no polling.
- **Modern API:** JSON-based REST API, replacing the old XML-based SOAP model.
- **Typed client libraries:** Fully typed libraries in Node.js and Python with autocomplete, inline docs, and type validation for endpoints, parameters, and responses.
- **Request handling:** Invisibly manages queues, timeouts, retries, and pagination.
- **Multi-company support:** Connects to multiple QuickBooks Desktop company files.
- **Validation:** Sanitizes and validates all inputs and outputs.
- **Unified error handling:** Streamlines error handling across the QuickBooks stack.
- **Authentication flow UI:** Simple UI for securely connecting QuickBooks Desktop accounts.
- **Dashboard**: UI to monitor and manage your QuickBooks Desktop connections and data.
- **Error resolution:** Detailed guides and instructions for resolving errors and handling edge cases.

## What is this repo?

This repository is a library for conveniently accessing Conductor's QuickBooks Desktop API from TypeScript or JavaScript. The library is a wrapper around the Conductor REST API, providing a fully-typed, easy-to-use interface for fetching, creating, and updating QuickBooks Desktop objects.

## Requirements

1. A Conductor API key pair: one secret key, one publishable key. **Please [sign up to join the beta](https://73a5v9t55ed.typeform.com/to/VRX7rfrN).**
2. Node.js v16 or later.

## Documentation

1. [Get Started](https://docs.conductor.is/overview/get-started)
2. [Quickstart](https://docs.conductor.is/overview/quickstart)
3. [Node.js / TypeScript API](https://docs.conductor.is/qbd/api)
4. [REST API](https://docs.conductor.is/qbd/rest)
5. [API Reference](https://docs.conductor.is/apis)
6. [Error Handling](https://docs.conductor.is/usage/error-handling)

## Installation

```sh
npm install conductor-node
# or
yarn add conductor-node
```

## Usage

The full API documentation is available [here](https://docs.conductor.is) along with many code examples. The following is a quickstart example:

```ts
import Conductor from "conductor-node";

const conductor = new Conductor("{{YOUR_SECRET_KEY}}");

async function main() {
  // 1. Create a new EndUser.
  const endUser = await conductor.endUsers.create({
    companyName: "{{END_USER_COMPANY_NAME}}",
    sourceId: "{{UNIQUE_ID_FROM_YOUR_DB}}",
    email: "{{END_USER_EMAIL}}",
  });
  console.log("Save this EndUser ID to auth future requests:", endUser.id);

  // 2. Create an AuthSession to establish the QuickBooks Desktop connection.
  const authSession = await conductor.authSessions.create({
    publishableKey: "{{YOUR_PUBLISHABLE_KEY}}",
    endUserId: endUser.id,
  });
  console.log("Complete the QuickBooks Desktop auth:", authSession.authFlowUrl);

  // 3. Get a list of invoices from this EndUser's QuickBooks Desktop.
  const qbdInvoices = await conductor.qbd.customer.query(endUser.id, {
    MaxReturned: 10,
  });
  console.log("QuickBooks Desktop invoices:", qbdInvoices);
}

main();
```

## More documentation

Please see our [full documentation site](https://docs.conductor.is) for more docs, guides, and code examples.
