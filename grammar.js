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
    source_file: ($) => repeat(seq($.statement, ";")),

    source: ($) => {
      return seq(
        "{",
        repeat(seq($.statement, ";")),
        optional($.statement),
        "}",
      );
    },

    statement: ($) => $._expression,

    _expression: ($) => {
      return choice(
        $.source,
        $.parenthesize,
        $.multiplicative,
        $.additive,
        $.comparison,
        $.logical,
        $.assign,
        $.identifier,
        $._number,
        $._string,
        $.numbers,
        $.booleans,
      );
    },

    parenthesize: ($) => {
      return seq("(", $._expression, ")");
    },

    multiplicative: ($) => {
      return prec.left(
        5,
        seq(
          $._expression,
          choice(
            alias($.operator_multiply, $.multiply),
            alias($.operator_divide, $.divide),
            alias($.operator_modulo, $.modulo),
          ),
          $._expression,
        ),
      );
    },

    operator_multiply: () => "*",
    operator_divide: () => "/",
    operator_modulo: () => "%",

    additive: ($) => {
      return prec.left(
        4,
        seq(
          optional($._expression),
          choice(
            alias($.operator_add, $.add),
            alias($.operator_subtract, $.subtract),
          ),
          $._expression,
        ),
      );
    },

    operator_add: () => "+",
    operator_subtract: () => "-",

    comparison: ($) => {
      return prec.left(
        3,
        seq(
          $._expression,
          choice(
            alias($.operator_equal, $.equal),
            alias($.operator_not_equal, $.not_equal),
            alias($.operator_less_than, $.less_than),
            alias($.operator_greater_than, $.greater_than),
            alias($.operator_less_equal, $.less_equal),
            alias($.operator_greater_equal, $.greater_equal),
          ),
          $._expression,
        ),
      );
    },

    operator_equal: () => "==",
    operator_not_equal: () => "!=",
    operator_less_than: () => "<",
    operator_greater_than: () => ">",
    operator_less_equal: () => "<=",
    operator_greater_equal: () => ">=",

    logical: ($) => {
      return choice(
        prec.left(
          2,
          seq($._expression, alias($.operator_and, $.and), $._expression),
        ),
        prec.left(
          1,
          seq($._expression, alias($.operator_or, $.or), $._expression),
        ),
      );
    },

    operator_and: () => "&&",
    operator_or: () => "||",

    assign: ($) => {
      return prec.right(
        0,
        seq(
          $._expression,
          choice(
            alias($.assign_constant, $.constant),
            alias($.assign_variable, $.variable),
          ),
          $._expression,
        ),
      );
    },

    assign_constant: () => ":",
    assign_variable: () => "=",

    _number: ($) => {
      return choice(
        alias($.number_binary, $.binary),
        alias($.number_octal, $.octal),
        alias($.number_decimal, $.decimal),
        alias($.number_hex, $.hex),
      );
    },

    number_binary: () => /0[Bb][0-1]+/,
    number_octal: () => /0[Oo][0-7]+/,
    number_decimal: () => /0[Dd][0-9]+/,
    number_hex: () => /0[Xx][0-9A-Fa-f]+/,

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

    string_single_quoted_unescaped_string: () =>
      token.immediate(prec(1, /[^'\\\r\n]+/)),
    string_double_quoted_unescaped_string: () =>
      token.immediate(prec(1, /[^"\\\r\n]+/)),

    string_single_quoted: ($) => {
      return seq(
        "'",
        repeat(
          choice(
            alias($.string_single_quoted_unescaped_string, $.string),
            $.escape,
          ),
        ),
        "'",
      );
    },
    string_double_quoted: ($) => {
      return seq(
        '"',
        repeat(
          choice(
            alias($.string_double_quoted_unescaped_string, $.string),
            $.escape,
          ),
        ),
        '"',
      );
    },

    _string: ($) => {
      return choice(
        alias($.string_single_quoted, $.single_quoted),
        alias($.string_double_quoted, $.double_quoted),
      );
    },

    numbers: ($) => {
      return choice(alias($.numbers_zero, $.zero));
    },

    numbers_zero: () => /0/,

    booleans: ($) => {
      return choice(
        alias($.booleans_false, $.false),
        alias($.booleans_true, $.true),
      );
    },

    booleans_false: () => "false",
    booleans_true: () => "true",

    identifier: () => /\w+/,
  },
});
