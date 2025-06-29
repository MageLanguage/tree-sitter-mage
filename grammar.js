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

    name: () => /\w+/,
    call: ($) =>
      seq(
        $.identifier,
        "(",
        optional(seq($.expression, repeat(seq(",", $.expression)))),
        ")",
      ),

    identifier_chain: ($) => seq($.identifier, repeat(seq(".", $.identifier))),
    identifier: ($) => choice($.name, $.call),

    arithmetic: () => choice("+", "-", "*", "/", "%"),

    definition_operation: () => choice(":", "="),
    definition: ($) => seq($.identifier_chain, $.definition_operation),

    expression: ($) => {
      let variable = choice(
        $.prioritize,
        $.identifier_chain,
        $.number,
        $.string,
        $.source,
      );

      return seq(
        repeat($.arithmetic),
        variable,
        repeat(seq(repeat1($.arithmetic), variable)),
      );
    },

    prioritize: ($) => seq("[", $.expression, "]"),

    statement_chain: ($) =>
      seq($.statement, repeat(seq(";", $.statement)), optional(";")),
    statement: ($) => seq(repeat($.definition), $.expression),
  },
});
