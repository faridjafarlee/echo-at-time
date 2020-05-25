module.exports = {
  "extends": "standard",
  "parser": "babel-eslint",
  "rules": {
    "semi": ["error", "always"],
    "no-unused-vars": 1,
    "spaced-comment": ["warn"],
    "no-trailing-spaces": ["warn"],
    "comma-dangle": ["error", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "always-multiline",
      "exports": "always-multiline",
      "functions": "always-multiline"
    }],
    "space-before-function-paren": ["error", {
      "anonymous": "always",
      "named": "never",
      "asyncArrow": "always"
    }]
  },
  "overrides": [{
    "files": ["spec/tests/*.js", "spec/tests/**/*.js"],
    "rules": {
      "no-unused-expressions": 0,
      "no-unused-vars": 1
    }
  }]
};