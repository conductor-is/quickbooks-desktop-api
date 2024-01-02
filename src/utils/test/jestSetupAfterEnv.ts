// Despite the Jest tests in `client-node` never using this URL, we override it
// here to prevent any tests from accidentally hitting the production API server
// during their development.
process.env["CONDUCTOR_MOCK_API_SERVER_URL"] = "http://localhost:4000";
