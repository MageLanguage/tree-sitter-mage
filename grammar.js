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
      return seq(
        optional(seq($._assignable, choice($.constant, $.variable))),
        $._expression,
      );
    },

    _assignable: ($) => {
      return choice($.call, $.identifier);
    },

    constant: () => ":",
    variable: () => "=",

    _expression: ($) => {
      return choice(
        $._string,
        $._number,
        $.unary,
        $.binary,
        $.comparison,
        $.logical,
        $.call,
        $.identifier,
        $.parenthesize,
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

    number_zero: () => /0/,
    number_binary: () => /0[Bb][0-1]+/,
    number_octal: () => /0[Oo][0-7]+/,
    number_decimal: () => /0[Dd][0-9]+/,
    number_hex: () => /0[Xx][0-9A-Fa-f]+/,

    _number: ($) => {
      return choice(
        alias($.number_zero, $.zero),
        alias($.number_binary, $.binary),
        alias($.number_octal, $.octal),
        alias($.number_decimal, $.decimal),
        alias($.number_hex, $.hex),
      );
    },

    call: ($) => {
      return seq(
        $._assignable,
        "[",
        optional(
          seq($._expression, repeat(seq(",", $._expression)), optional(",")),
        ),
        "]",
      );
    },

    operator_add: () => "+",
    operator_subtract: () => "-",
    operator_multiply: () => "*",
    operator_divide: () => "/",
    operator_modulo: () => "%",

    operator_equal: () => "==",
    operator_not_equal: () => "!=",
    operator_less_than: () => "<",
    operator_greater_than: () => ">",
    operator_less_equal: () => "<=",
    operator_greater_equal: () => ">=",

    operator_and: () => "&&",
    operator_or: () => "||",

    unary: ($) => {
      return prec.right(
        6,
        seq(
          choice(
            alias($.operator_add, $.add),
            alias($.operator_subtract, $.subtract),
          ),
          $._expression,
        ),
      );
    },

    binary: ($) => {
      return choice(
        prec.left(
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
        ),
        prec.left(
          4,
          seq(
            $._expression,
            choice(
              alias($.operator_add, $.add),
              alias($.operator_subtract, $.subtract),
            ),
            $._expression,
          ),
        ),
      );
    },

    comparison: ($) => {
      return prec.right(
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

    logical: ($) => {
      return choice(
        prec.right(
          2,
          seq($._expression, alias($.operator_and, $.and), $._expression),
        ),
        prec.right(
          1,
          seq($._expression, alias($.operator_or, $.or), $._expression),
        ),
      );
    },

    parenthesize: ($) => {
      return seq("(", $._expression, ")");
    },

    identifier: () => /\w+/,
  },
});
