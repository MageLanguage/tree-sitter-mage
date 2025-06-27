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
    source_file: ($) => optional($.statement_chain),
    source: ($) => seq("{", optional($.statement_chain), "}"),

    string: () => /"[^"]*"/,

    zero: () => "0",
    binary: () => /0[Bb][0-1]+/,
    octal: () => /0[Oo][0-7]+/,
    decimal: () => /0[Dd][0-9]+/,
    hex: () => /0[Xx][0-9A-Fa-f]+/,

    number: ($) => choice($.zero, $.binary, $.octal, $.decimal, $.hex),

    math_operation: ($) => choice("+", "-", "*", "/", "%"),
    math: ($) => {
      let variable = choice($.identifier_chain, $.number);

      return seq(
        "[",
        optional(variable),
        repeat(seq($.math_operation, variable)),
        "]",
      );
    },

    name: () => /\w+/,
    call: ($) =>
      seq(
        $.identifier,
        "(",
        optional(seq($.statement, repeat(seq(",", $.statement)))),
        ")",
      ),

    identifier_chain: ($) => seq($.identifier, repeat(seq(".", $.identifier))),
    identifier: ($) => choice($.name, $.call),

    expression: ($) => choice($.identifier_chain, $.math, $.string, $.source),

    definition_operation: ($) => choice(":", "="),
    definition: ($) =>
      seq(
        repeat1(seq($.identifier_chain, $.definition_operation)),
        $.expression,
      ),

    statement_chain: ($) =>
      seq($.statement, repeat(seq(";", $.statement)), optional(";")),
    statement: ($) => choice($.definition, $.expression),
  },
});
