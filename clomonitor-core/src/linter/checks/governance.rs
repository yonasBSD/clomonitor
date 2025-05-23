use std::sync::LazyLock;

use anyhow::Result;
use regex::RegexSet;

use crate::linter::{
    check::{CheckId, CheckInput, CheckOutput},
    CheckSet,
};

use super::util::helpers::find_file_or_readme_ref;

/// Check identifier.
pub(crate) const ID: CheckId = "governance";

/// Check score weight.
pub(crate) const WEIGHT: usize = 3;

/// Check sets this check belongs to.
pub(crate) const CHECK_SETS: [CheckSet; 1] = [CheckSet::Community];

/// Patterns used to locate a file in the repository.
const FILE_PATTERNS: [&str; 2] = ["governance*", "docs/governance*"];

static README_REF: LazyLock<RegexSet> = LazyLock::new(|| {
    RegexSet::new([
        r"(?im)^#+.*governance.*$",
        r"(?im)^governance$",
        r"(?i)\[.*governance.*\]\(.*\)",
    ])
    .expect("exprs in README_REF to be valid")
});

/// Check main function.
pub(crate) fn check(input: &CheckInput) -> Result<CheckOutput> {
    // File in repo or reference in README file
    find_file_or_readme_ref(input, &FILE_PATTERNS, &README_REF)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn readme_ref_match() {
        assert!(README_REF.is_match("# Governance"));
        assert!(README_REF.is_match(
            r"
...
## Project governance and others
...
            "
        ));
        assert!(README_REF.is_match(
            r"
...
Governance
----------
...
            "
        ));
        assert!(README_REF.is_match("[Project governance](...)"));
    }
}
