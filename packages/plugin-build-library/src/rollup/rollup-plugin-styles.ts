/* eslint-disable consistent-return */
import path from 'path';
import {promisify} from 'util';

import {createFilter} from '@rollup/pluginutils';
import nodeSass from 'node-sass';
import postcss from 'postcss';
import cssModules from 'postcss-modules';
import type {PluginContext, Plugin, OutputBundle, GetModuleInfo} from 'rollup';

interface Options {
  output?: string;
  plugins?: string[];
  modules?: {[key: string]: unknown};
  mode?: string;
  include?: string[];
  exclude?: string[];
}

interface PostCssOutput {
  css: string;
  tokens: unknown;
}

export function styles({
  output = '',
  plugins = [],
  modules = {},
  mode = '',
  include = ['**/*.css', '**/*.scss'],
  exclude = [],
}: Options = {}): Plugin {
  if (!['standalone', 'esnext'].includes(mode)) {
    throw new Error(
      `Expected mode to be either "standalone" or "esnext", but got "${mode}"`,
    );
  }

  const filter = createFilter(include, exclude);

  const renderSass = promisify(nodeSass.render);

  const styleProcessor = postcss([
    cssModules({
      ...modules,
      getJSON() {},
    }),
    ...plugins,
  ]);

  let inputRoot: string;

  const processedExt = '.css';

  const cssByFile: {[key: string]: string} = {};

  function transformStandalone(id: string, postCssOutput: PostCssOutput) {
    cssByFile[id] = postCssOutput.css;

    const properties = JSON.stringify(postCssOutput.tokens, null, 2);
    // no-tresshake to ensure that css files with no exports or unused exports
    // (e.g. AppProvider that contains global css but no classnames and thus no
    // exports) still appear in the bundle's list of modules in generateBundle
    return {
      code: `export default ${properties};`,
      moduleSideEffects: 'no-treeshake',
    };
  }

  function transformEsNext(
    pluginContext: PluginContext,
    id: string,
    postCssOutput: PostCssOutput,
  ) {
    const relativePath = `./${path.relative(
      path.dirname(id),
      id.replace(/\.scss$/, processedExt),
    )}`;

    pluginContext.emitFile({
      type: 'asset',
      fileName: id
        .replace(`${inputRoot}/`, '')
        .replace(/\.scss$/, processedExt),
      source: postCssOutput.css,
    });

    const properties = JSON.stringify(postCssOutput.tokens, null, 2);
    // No need to specify no-treeshake here as .css files get treated as
    // external and thus their imports will not be tree shaken away anyway
    return {
      code: `import './${relativePath}';\nexport default ${properties};`,
    };
  }

  function generateBundleStandalone(
    pluginContext: PluginContext,
    _: unknown,
    bundle: OutputBundle,
  ) {
    // generateBundle gets called once per call to bundle.write(). We call
    // that twice - once for the commonjs build (the index.js file), once for
    // the esm build (the esm folder). We only want to do perform this logic
    // once in the commonjs build
    // TODO work out how consumers can control if this should be called for a
    // given invocation of writeBundle - probably make output a builder function
    // that takes in generateOptions

    if (typeof output !== 'string') {
      return;
    }

    // Items are added to cssByFile based on the order that transforms are
    // resolved. This may change between runs so we can't rely on it.
    // The contents of the emitted css file should use the order in which the
    // files were referenced in the compiled javascript, which can be obtained
    // by looking at bundles[].modules.
    const entrypointBundles = Object.values(bundle).filter(
      (bundleInfo) => (bundleInfo as any).isEntry,
    );
    const bundleModuleIds = flatMap(entrypointBundles, (bundleInfo) =>
      getRecursiveImportOrder(
        bundleInfo.facadeModuleId,
        pluginContext.getModuleInfo,
      ),
    );

    const missingReferences = Object.keys(cssByFile).filter(
      (id) => !bundleModuleIds.includes(id),
    );

    if (missingReferences.length) {
      const formatedMissingIds = missingReferences.join('\n');
      pluginContext.warn(
        `cssByFile contains ids not present in bundleModuleIds. Your output may be incomplete. Missing:\n${formatedMissingIds} `,
      );
    }

    let css = bundleModuleIds
      .filter((id) => id in cssByFile)
      .map((id) => cssByFile[id])
      .join('\n\n');

    try {
      css = hoistCharsetDeclaration(css);
    } catch (err) {
      pluginContext.error(err.message);
    }

    // Regular css file
    pluginContext.emitFile({type: 'asset', fileName: output, source: css});
  }

  return {
    name: 'styles',

    buildStart({input}) {
      let dirname: string;
      if (Array.isArray(input)) {
        dirname = input[0];
      } else {
        dirname = Object.values(input)[0];
      }
      inputRoot = path.dirname(dirname);
    },

    // Treat CSS files as external - don't try and resolve them within Rollup
    // This only gets triggered in esnext mode when we emit imports of css files
    resolveId(source, importer) {
      if (source.endsWith(processedExt)) {
        return {
          id: path.resolve(path.dirname(importer as string), source),
          external: true,
        };
      }
    },

    async transform(
      source: string,
      id: string,
    ): Promise<
      | {
          code: string;
        }
      | null
      | undefined
    > {
      if (!filter(id)) {
        return null;
      }

      const sassOutput = await renderSass({
        data: source,
        outputStyle: 'compact',
        includePaths: [path.dirname(id)],
      }).then((result) => result.css.toString());

      const postCssOutput = await styleProcessor
        .process(sassOutput, {from: id})
        .then((result) => ({
          css: result.css,
          tokens: result.messages.find(({plugin, type}) => {
            return plugin === 'postcss-modules' && type === 'export';
          })?.exportTokens,
        }));

      if (mode === 'standalone') {
        return transformStandalone(id, postCssOutput);
      }
      if (mode === 'esnext') {
        return transformEsNext(this, id, postCssOutput);
      }
    },

    generateBundle(_: unknown, bundle: OutputBundle) {
      if (mode === 'standalone') {
        return generateBundleStandalone(this, null, bundle);
      }
    },
  };
}

// We're still using node 10. Array.flat(fn)/Array.flatMap(fn) are added in v11
function flatMap(array: any[], fn: (item: any) => void) {
  return array.reduce((memo: any[], item: any) => memo.concat(fn(item)), []);
}

// An @charset declaration must be at the top of a css file rather than part
// way through. Because we're combining multiple files we need to make sure
// that's handled correctly.
function hoistCharsetDeclaration(css: string) {
  let result = css;

  const charsetRegex = /(?<=\n|^)@charset .*;\n/;
  let standaloneCssFileCharset = '';
  let charsetMatch;

  // This would be a lot more readable with String.matchAll in node v12
  while ((charsetMatch = charsetRegex.exec(result)) !== null) {
    // If multiple source files have a charset but they differ then we've
    // got a problem when it comes to combining them. This shouldn't ever
    // happen though as prettier/editorconfig should force all our source
    // files to be UTF-8
    if (
      standaloneCssFileCharset !== '' &&
      charsetMatch[0] === standaloneCssFileCharset
    ) {
      throw new Error(
        'Found multiple conflicting @charset declarations in css content',
      );
    }

    standaloneCssFileCharset = charsetMatch[0];
    result = result.replace(charsetMatch[0], '');
  }

  return `${standaloneCssFileCharset}${result}`;
}

/**
 * Recursivly get the correct import order from rollup
 * We only process a file once
 *
 * @param {string} id
 * @param {Function} getModuleInfo
 * @param {Set<string>} seen
 */
function getRecursiveImportOrder(
  id: string,
  getModuleInfo: GetModuleInfo,
  seen = new Set(),
) {
  if (seen.has(id)) {
    return [];
  }

  seen.add(id);

  const result = [id];
  getModuleInfo(id)?.importedIds.forEach((importFile) => {
    result.push(...getRecursiveImportOrder(importFile, getModuleInfo, seen));
  });

  return result;
}
