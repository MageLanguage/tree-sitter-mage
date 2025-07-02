/**
 * @file Mage grammar for tree-sitter
 * @author Alexander Kosachev <kosachev_alex@mail.ru>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "mage",

  rules: {
    source_file: ($) => {
      return repeat(seq($.statement, ";"));
    },

    statement: ($) => {
      return seq(optional(seq($._definition, $._as)), $._expression);
    },

    _definition: ($) => {
      return choice($.call, $.name);
    },

    constant: () => ":",
    variable: () => "=",

    _as: ($) => choice($.constant, $.variable),

    _expression: ($) => {
      return choice($._string, $._number, $.math, $.call, $.name);
    },

    escape: () =>
      token.immediate(
        seq(
          "\\",
          choice(
            /[^xu0-7]/,
            /[0-7]{1,3}/,
            /x[0-9a-fA-F]{2}/,
            /u[0-9a-fA-F]{4}/,
            /u\{[0-9a-fA-F]+\}/,
            /[\r?][\n\u2028\u2029]/,
          ),
        ),
      ),

    single_quoted_unescaped_string: () =>
      token.immediate(prec(1, /[^'\\\r\n]+/)),
    double_quoted_unescaped_string: () =>
      token.immediate(prec(1, /[^"\\\r\n]+/)),

    single_quoted: ($) => {
      return seq(
        "'",
        repeat(
          choice(alias($.single_quoted_unescaped_string, $.string), $.escape),
        ),
        "'",
      );
    },
    double_quoted: ($) => {
      return seq(
        '"',
        repeat(
          choice(alias($.double_quoted_unescaped_string, $.string), $.escape),
        ),
        '"',
      );
    },

    _string: ($) => {
      return choice($.single_quoted, $.double_quoted);
    },

    zero: () => /0/,
    binary: () => /0[Bb][0-1]+/,
    octal: () => /0[Oo][0-7]+/,
    decimal: () => /0[Dd][0-9]+/,
    hex: () => /0[Xx][0-9A-Fa-f]+/,

    _number: ($) => {
      return choice($.zero, $.binary, $.octal, $.decimal, $.hex);
    },

    call: ($) => {
      return seq(
        $._definition,
        "(",
        optional(
          seq($._expression, repeat(seq(",", $._expression)), optional(",")),
        ),
        ")",
      );
    },

    add: () => "+",
    substract: () => "-",
    multiply: () => "*",
    divide: () => "/",
    modulo: () => "%",

    _arithmetic: ($) => {
      return choice($.add, $.substract, $.multiply, $.divide, $.modulo);
    },
    math: ($) => {
      return prec.left(1, seq($._expression, $._arithmetic, $._expression));
    },

    name: () => /\w+/,

    // expression_section_start: ($) => {
    //   return seq(repeat($.arithmetic), $.variable);
    // },

    // expression_section: ($) => {
    //   return seq(repeat1($.arithmetic), $.variable);
    // },

    // number: ($) => {
    //   return choice($.zero, $.binary, $.octal, $.decimal, $.hex);
    // },

    // identifier_chain: ($) => {
    //   return seq($.identifier, repeat(seq(".", $.identifier)));
    // },

    // identifier: ($) => {
    //   return choice($.call, $.name);
    // },

    // expression_call: ($) => {
    //   return seq($.name, $.expression_call_argument_list);
    // },

    // expression_call_argument_list: ($) => {
    //   return seq(
    //     "(",
    //     optional(
    //       seq($.expression, repeat(seq(";", $.expression)), optional(";")),
    //     ),
    //     ")",
    //   );
    // },

    // expresiion_math: ($) => {
    //   return seq($.expression);
    // },

    // arithmetic: () => choice("+", "-", "*", "/", "%"),

    // variable: ($) =>
    //   choice($.prioritize, $.identifier_chain, $.number, $.string, $.source),

    // definition_operation: () => choice(":", "="),
    // definition: ($) => seq($.identifier_chain, $.definition_operation),

    // prioritize: ($) => seq("[", $.expression, "]"),
  },
});
