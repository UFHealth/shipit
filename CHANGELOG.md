# CHANGELOG


<h2 class="ReleaseVersion">0.3.3</h2>

<p class="ReleaseDate">
  <time datetime="2021-05-13T13:55:17.592Z">05/13/2021</time>
</p>


### Fixed
- Patched `y18n` and `yargs-parser` (dependabot)


<h2 class="ReleaseVersion">0.3.2</h2>

<p class="ReleaseDate">
  <time datetime="2020-05-11T16:52:11.588Z">05/11/2020</time>
</p>


### Updated
- Added heading and date markup to changelog

### 0.3.1 - 02/12/2020

**Fixed**
- Fix relative path to generator template

### 0.3.0 - 02/06/2020

**New**
- Added `--generate` option for generating YAML files from the provided `template.yml`.
- Added docs for YAML formatting and categories.
- Added 'External' category for jargon-free changelog notes.

**Updated**
- Added a better error message for missing changelog when version bumping.
- Added date stamps when generating the header for CHANGELOG content.

### 0.2.1

**Fixed**
- Added missing documentation for config locations.

### 0.2.0

**New**
- Added documentation.
- Added full dry-run support for full-file version bumps.

**Updated**
- Updated package definition for publishing.

**Fixed**
- Respect dry-run flag when bumping package.json.

### 0.1.1

**Updated**
- Removed `logit` command from package until it's implemented.

**Fixed**
- Fixed replacement count logic in version bumping feedback.

### 0.1.0

**New**
- First pass
