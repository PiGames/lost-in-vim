module.exports = {
  "extends": "idiomatic",
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
  },
  "parser": "babel-eslint",
  "rules": {
    "comma-dangle": ["error", {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "never",
        "exports": "never",
        "functions": "never"
    }],
    "no-console": 0,
    "one-var": ["error", "never"],
    "semi": ["error", "always"],
    "linebreak-style": 0,
    "func-names": 0,
  }
}
