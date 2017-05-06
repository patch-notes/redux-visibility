module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "env": {
    "mocha": true,
    "node": true
  },
  "rules": {
    "no-underscore-dangle": "off",
    "import/no-extraneous-dependencies": ["error", {
      "devDependencies": ["test/**"]
    }]
  }
};
