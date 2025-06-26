package tree_sitter_mage_test

import (
	"testing"

	tree_sitter_mage "github.com/MageLanguage/tree-sitter-mage/bindings/go"
	tree_sitter "github.com/tree-sitter/go-tree-sitter"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_mage.Language())
	if language == nil {
		t.Errorf("Error loading Mage grammar")
	}
}
