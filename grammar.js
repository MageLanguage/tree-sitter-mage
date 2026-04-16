/**
 * @file Mage grammar for tree-sitter
 * @author Aleksandr Kosachev <gohryt@rays-of-good.online>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "mage",

  conflicts: ($) => [[$._argument_atom, $._atom]],

  rules: {
    source_file: ($) =>
      seq(repeat(seq($._statement, ";")), optional($._statement)),

    source: ($) =>
      seq("{", repeat(seq($._statement, ";")), optional($._statement), "}"),

    parenthesize: ($) => seq("(", $._statement, ")"),

    _statement: ($) =>
      choice(
        $.constant_assignment,
        $.multiple_variable_assignment,
        $.variable_assignment,
        $._expression,
      ),

    constant_assignment: ($) =>
      prec.right(
        seq(
          field("name", $._member_expression),
          alias(":", $.constant),
          field("value", $._expression),
        ),
      ),

    variable_assignment: ($) =>
      prec.right(
        seq(
          field("name", $._member_expression),
          alias("=", $.variable),
          field("value", $._expression),
        ),
      ),

    multiple_variable_assignment: ($) =>
      prec.right(
        seq(
          field("names", alias($._name_list, $.name_list)),
          alias("=", $.variable),
          field("value", $._expression),
        ),
      ),

    _name_list: ($) => seq($.identifier, repeat1(seq(",", $.identifier))),

    _expression: ($) => $._comparison_expression,

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
          alias("<", $.less_than_sign),
          $._arithmetic_expression,
        ),
      ),

    greater_than: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_expression,
          alias(">", $.greater_than_sign),
          $._arithmetic_expression,
        ),
      ),

    less_than_or_equal: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_expression,
          alias("<=", $.less_than_or_equal_sign),
          $._arithmetic_expression,
        ),
      ),

    greater_than_or_equal: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_expression,
          alias(">=", $.greater_than_or_equal_sign),
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
      prec.left(
        5,
        seq($._arithmetic_expression, alias("+", $.addition), $._term),
      ),

    subtractive: ($) =>
      prec.left(
        5,
        seq($._arithmetic_expression, alias("-", $.subtraction), $._term),
      ),

    _term: ($) =>
      choice($.multiplicative, $.divisive, $.modulo, $._postfix_expression),

    multiplicative: ($) =>
      prec.left(
        6,
        seq($._term, alias("*", $.multiplication), $._postfix_expression),
      ),

    divisive: ($) =>
      prec.left(6, seq($._term, alias("/", $.division), $._postfix_expression)),

    modulo: ($) =>
      prec.left(6, seq($._term, alias("%", $.modulus), $._postfix_expression)),

    _postfix_expression: ($) => choice(prec(1, $.call), $._atom),

    call: ($) =>
      prec.left(
        7,
        seq(
          field("name", $._postfix_expression),
          field(
            "arguments",
            alias($._application_argument_list, $.argument_list),
          ),
        ),
      ),

    _application_argument_list: ($) =>
      seq($._application_argument, repeat(seq(",", $._application_argument))),

    _application_argument: ($) => $._comparison_argument,

    _comparison_argument: ($) =>
      choice(
        alias($._argument_less_than, $.less_than),
        alias($._argument_greater_than, $.greater_than),
        alias($._argument_less_than_or_equal, $.less_than_or_equal),
        alias($._argument_greater_than_or_equal, $.greater_than_or_equal),
        alias($._argument_equal, $.equal),
        alias($._argument_not_equal, $.not_equal),
        $._arithmetic_argument,
      ),

    _argument_less_than: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_argument,
          alias("<", $.less_than_sign),
          $._arithmetic_argument,
        ),
      ),

    _argument_greater_than: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_argument,
          alias(">", $.greater_than_sign),
          $._arithmetic_argument,
        ),
      ),

    _argument_less_than_or_equal: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_argument,
          alias("<=", $.less_than_or_equal_sign),
          $._arithmetic_argument,
        ),
      ),

    _argument_greater_than_or_equal: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_argument,
          alias(">=", $.greater_than_or_equal_sign),
          $._arithmetic_argument,
        ),
      ),

    _argument_equal: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_argument,
          alias("==", $.equal_sign),
          $._arithmetic_argument,
        ),
      ),

    _argument_not_equal: ($) =>
      prec.left(
        4,
        seq(
          $._arithmetic_argument,
          alias("!=", $.not_equal_sign),
          $._arithmetic_argument,
        ),
      ),

    _arithmetic_argument: ($) =>
      choice(
        alias($._argument_additive, $.additive),
        alias($._argument_subtractive, $.subtractive),
        $._term_argument,
      ),

    _argument_additive: ($) =>
      prec.left(
        5,
        seq($._arithmetic_argument, alias("+", $.addition), $._term_argument),
      ),

    _argument_subtractive: ($) =>
      prec.left(
        5,
        seq(
          $._arithmetic_argument,
          alias("-", $.subtraction),
          $._term_argument,
        ),
      ),

    _term_argument: ($) =>
      choice(
        alias($._argument_multiplicative, $.multiplicative),
        alias($._argument_divisive, $.divisive),
        alias($._argument_modulo, $.modulo),
        $._argument_atom,
      ),

    _argument_multiplicative: ($) =>
      prec.left(
        6,
        seq($._term_argument, alias("*", $.multiplication), $._argument_atom),
      ),

    _argument_divisive: ($) =>
      prec.left(
        6,
        seq($._term_argument, alias("/", $.division), $._argument_atom),
      ),

    _argument_modulo: ($) =>
      prec.left(
        6,
        seq($._term_argument, alias("%", $.modulus), $._argument_atom),
      ),

    _argument_atom: ($) =>
      choice(
        $.parenthesize,
        $._member_expression,
        $._number,
        $._string,
        prec(-1, $.source),
      ),

    _atom: ($) =>
      choice(
        $.parenthesize,
        $._member_expression,
        $._number,
        $._string,
        prec(-1, $.source),
      ),

    _member_expression: ($) => choice($.member, $.identifier),

    member: ($) =>
      prec.left(
        8,
        seq(
          field("object", $._postfix_expression),
          alias(".", $.extract),
          field("property", $.identifier),
        ),
      ),

    _number: ($) =>
      choice(
        alias($.number_binary, $.binary),
        alias($.number_octal, $.octal),
        alias($.number_decimal, $.decimal),
        alias($.number_hexadecimal, $.hexadecimal),
        alias($.number_integer, $.integer),
      ),

    number_binary: () => /0[Bb][0-1]+/,
    number_octal: () => /0[Oo][0-7]+/,
    number_decimal: () => /0[Dd][0-9]+/,
    number_hexadecimal: () => /0[Xx][0-9A-Fa-f]+/,
    number_integer: () => /[0-9]+/,

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
