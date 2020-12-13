// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',

  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020
  },

  env: {
    browser: true,
    node: true
  },

  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',

  // required to lint *.vue files
  plugins: [
    'html'
  ],

  // add your custom rules here
  'rules': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],

  rules: {
    indent: 0,
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
