/**
 * @file Mage grammar for tree-sitter
 * @author Aleksandr Kosachev <gohryt@rays-of-good.online>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "mage",

  rules: {
    source_file: ($) =>
      seq(repeat(seq($._statement, ";")), optional($._statement)),

    source: ($) =>
      seq("{", repeat(seq($._statement, ";")), optional($._statement), "}"),

    parenthesize: ($) => seq("(", $._statement, ")"),

    _statement: ($) =>
      choice($.constant_assignment, $.variable_assignment, $._pipe_expression),

    constant_assignment: ($) =>
      prec.right(
        seq(
          field("name", $._member_expression),
          alias(":", $.constant),
          field("value", $._pipe_expression),
        ),
      ),

    variable_assignment: ($) =>
      prec.right(
        seq(
          field("name", $._member_expression),
          alias("=", $.variable),
          field("value", $._pipe_expression),
        ),
      ),

    _pipe_expression: ($) => choice($.call, $._comparison_expression),

    call: ($) =>
      prec.left(
        seq(
          field("arguments", alias($._argument_list, $.argument_list)),
          alias("=>", $.pipe),
          field("name", $._call_target),
        ),
      ),

    _call_target: ($) =>
      choice($.implicit_member, $.parenthesize, $._member_expression),

    implicit_member: ($) => seq(alias(".", $.extract), $.identifier),

    _argument_list: ($) =>
      prec.left(
        1,
        seq($._pipe_expression, optional(seq(",", $._argument_list))),
      ),

    _comparison_expression: ($) =>
      choice(
        $.less_than,
        $.greater_than,
        $.less_than_or_equal,
        $.greater_than_or_equal,
        $.equal,
        $.not_equal,
        $._arithmetic_expression,
      ),

    less_than: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_expression,
          alias("<", $.less),
          $._arithmetic_expression,
        ),
      ),

    greater_than: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_expression,
          alias(">", $.greater),
          $._arithmetic_expression,
        ),
      ),

    less_than_or_equal: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_expression,
          alias("<=", $.less_or_equal),
          $._arithmetic_expression,
        ),
      ),

    greater_than_or_equal: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_expression,
          alias(">=", $.greater_or_equal),
          $._arithmetic_expression,
        ),
      ),

    equal: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_expression,
          alias("==", $.equal_sign),
          $._arithmetic_expression,
        ),
      ),

    not_equal: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_expression,
          alias("!=", $.not_equal_sign),
          $._arithmetic_expression,
        ),
      ),

    _arithmetic_expression: ($) => choice($.additive, $.subtractive, $._term),

    additive: ($) =>
      prec.left(5, seq($._arithmetic_expression, alias("+", $.add), $._term)),

    subtractive: ($) =>
      prec.left(
        5,
        seq($._arithmetic_expression, alias("-", $.subtract), $._term),
      ),

    _term: ($) => choice($.multiplicative, $.division, $.modulo, $._atom),

    multiplicative: ($) =>
      prec.left(6, seq($._term, alias("*", $.multiply), $._atom)),

    division: ($) => prec.left(6, seq($._term, alias("/", $.divide), $._atom)),

    modulo: ($) => prec.left(6, seq($._term, alias("%", $.mod), $._atom)),

    _atom: ($) =>
      choice(
        $.parenthesize,
        $.nullary_call,
        $._member_expression,
        $._number,
        $._string,
        prec(-1, $.source),
      ),

    nullary_call: ($) => seq(alias("=>", $.pipe), $._member_expression),

    _member_expression: ($) => choice($.member, $.identifier),

    member: ($) =>
      prec.left(
        7,
        seq(
          field("object", $._member_expression),
          alias(".", $.extract),
          field("property", $.identifier),
        ),
      ),

    _number: ($) =>
      choice(
        alias($.number_binary, $.binary),
        alias($.number_octal, $.octal),
        alias($.number_decimal, $.decimal),
        alias($.number_hex, $.hex),
        alias($.number_plain, $.plain),
      ),

    number_binary: () => /0[Bb][0-1]+/,
    number_octal: () => /0[Oo][0-7]+/,
    number_decimal: () => /0[Dd][0-9]+/,
    number_hex: () => /0[Xx][0-9A-Fa-f]+/,
    number_plain: () => /[0-9]+/,

    _string: ($) =>
      choice(
        alias($.string_single_quoted, $.single_quoted),
        alias($.string_double_quoted, $.double_quoted),
      ),

    _string_escape: () =>
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

    _single_quoted_content: () => token.immediate(/[^'\\\r\n]+/),
    _double_quoted_content: () => token.immediate(/[^"\\\r\n]+/),

    string_single_quoted: ($) =>
      seq(
        "'",
        repeat(
          choice(
            alias($._single_quoted_content, $.raw),
            alias($._string_escape, $.escape),
          ),
        ),
        "'",
      ),

    string_double_quoted: ($) =>
      seq(
        '"',
        repeat(
          choice(
            alias($._double_quoted_content, $.raw),
            alias($._string_escape, $.escape),
          ),
        ),
        '"',
      ),

    identifier: () => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});
