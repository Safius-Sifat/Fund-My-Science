module.exports = {
    env: {
        browser: false,
        es6: true,
        hardhat: true,
        node: true,
        mocha: true,
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "standard",
        "plugin:prettier/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "script", // Allow CommonJS
    },
    rules: {
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "node/no-unsupported-features/es-syntax": ["error", {
            "ignores": ["modules"]
        }],
        // Allow require() in contracts folder
        "@typescript-eslint/no-var-requires": "off",
        "import/no-commonjs": "off",
        "no-undef": "off",
        // Allow console.log in scripts and tests
        "no-console": "off",
        // Allow unused variables in some cases
        "no-unused-vars": ["error", {
            "argsIgnorePattern": "^_",
            "varsIgnorePattern": "^_"
        }],
    },
    overrides: [
        {
            files: ["scripts/**/*.js", "test/**/*.js"],
            rules: {
                // Even more relaxed rules for scripts and tests
                "@typescript-eslint/no-unused-vars": "off",
                "no-unused-vars": "off",
            }
        }
    ]
};
