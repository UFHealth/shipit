# Shipit

![I'm Gonna Ship It!](https://media.giphy.com/media/ta83CqOoRwfwQ/giphy.gif)

[Explainit](#explainit) | [Addit](#addit) | [Configureit](#configureit) | [Runit](#runit)


## Explainit

`Shipit` helps make releasing stuff easier, but without trying to automate too much. It does two things, explained in way too much detail below.

- **It generates changelog content from YAML files.**

    We're not fans of that contextual commit message changelog stuff—partly because it's another syntax and process to think about, but also because we have a lot of commit messages that say stuff like `Fix a f&$*ing typo` and `OMG WHY`. Our changelogs generally don't need to document every atomic change we make, they just need to give other humans an idea of the hot stuff we're rolling out in each release. So we opted for something kinda like [GitLab's approach](https://docs.gitlab.com/ee/development/changelog.html), but way easier. Multiple devs can document their changes independently as they go without worrying about merge conflicts. It's nice.

- **It handles version bumping, with your help.**

    `Shipit` will bump your package's version strings wherever you tell it to, but you have to tell it what version to use. Automatic semantic versioning is neat and all, but sometimes semantics can be a little fuzzy. And again, automated versioning tools usually rely on deriving context from special commit message syntax or branch names or code comments. It's extra stuff to think about that we don't really need—we already know the scope of the changes we're making, because we're the ones making them. If it feels like a `1.5`, that's cool. If it feels more like a `2.0`, that's cool too. You do you.

Anyway, let's do stuff.


## Addit

Just install as a `devDependency` with your preferred package thingy.

```sh
yarn add -D @ufhealth/shipit
npm install -D @ufhealth/shipit
```

You can [run it](#runit) out of the box with zero config, or configure it for your project's specific needs. Which brings us to the next section:


## Configureit

`Shipit` works out of the box, no config needed, with the following assumptions. All paths are relative to your **package.json**.

- Your YAML changelogs go in `resources/changelog/`
- Your Markdown changelog is named `CHANGELOG.md` and lives next to your **package.json**
- The only version string you need to bump is the one in your **package.json**

If that doesn't jive with your project, you can configure it so it does. Just add a `shipit` section in your **package.json**, or add a **.shipitrc** file next to it. Here's an exhaustive list of your options. All three of 'em.

### source
Type: `string`  
Default: `${process.cwd()}/resources/changelog`

Path to the _directory_ where your YAML changelog sources are located. It can be an absolute path, but we'd recommend using a relative one, which will be relative to your **package.json**.

### destination
Type: `string`  
Default: `${process.cwd()}/CHANGELOG.md`

Path to your Markdown changelog _file_. Again, this can be an absolute path, but we'd recommend using a relative one.

### bump
Type: `object`
Default: `{}`

A map of any files _besides_ **package.json** with version references you'd like to bump. Keys are relative paths to files to look at, and values are arrays of patterns to look for in the file. Just put the `<version>` placeholder where your version string should go.

Here's an example:

```json
{
  "relative/path/to/file.js": [
    "* My Package <version>"
  ],
  "path/to/something.php": [
    "const VERSION = '<version>';"
  ]
}
```

A few caveats:

- The placeholder matches against the _current_ version in your **package.json** when bumping, so if you just added it to the file, you need to use the actual current version, or it won't get picked up.
- Regular expression stuff is supported, but if you want to use subgroups like `(a|b|c)`, they must be _non-matching_ (i.e. `(?:a|b|c)`).
- Currently only one `<version>` placeholder per pattern is supported, so if you need to replace multiple version references in the same line, you'll have to use either regex voodoo or more than one pattern.


## Runit

```
Usage:
  $ shipit <version> [options]

Arguments:
  version  The next version of your package.

Options:
  --help     Display this help message.
  --version  Print the current shipit version.
  --dry-run  See what would happen if you ran this command IRL.
```

You can run `shipit` standalone:

```sh
node_modules/.bin/shipit <version>
```

Or add it to your `scripts` in **package.json**:

```json
{
  "scripts": {
    "release": "shipit"
  }
}
```

```sh
npm run release <version>
```

If you're using something like `npm-run-all` to compose scripts, it's a little trickier, since it requires an argument:

```json
{
  "scripts": {
    "build": "...",
    "shipit": "shipit",
    "release": "run-s \"shipit {@}\" build --"
  }
}
```

```sh
npm run release -- <version>
```

There is no Node API yet, but it's on the roadmap.
