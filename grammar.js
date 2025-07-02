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
      return choice(
        $._string,
        $._number,
        $.unary,
        $.binary,
        $.call,
        $.name,
        $.prioritize,
      );
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

    number_zero: () => /0/,
    number_binary: () => /0[Bb][0-1]+/,
    number_octal: () => /0[Oo][0-7]+/,
    number_decimal: () => /0[Dd][0-9]+/,
    number_hex: () => /0[Xx][0-9A-Fa-f]+/,

    _number: ($) => {
      return choice(
        $.number_zero,
        $.number_binary,
        $.number_octal,
        $.number_decimal,
        $.number_hex,
      );
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
    subtract: () => "-",
    multiply: () => "*",
    divide: () => "/",
    modulo: () => "%",

    binary: ($) => {
      return prec.right(
        1,
        seq(
          $._expression,
          choice($.add, $.subtract, $.multiply, $.divide, $.modulo),
          $._expression,
        ),
      );
    },

    unary: ($) => {
      return prec.right(1, seq(choice($.add, $.subtract), $._expression));
    },

    prioritize: ($) => {
      return seq("[", $._expression, "]");
    },

    name: () => /\w+/,
  },
});
