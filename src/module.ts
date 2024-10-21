import type { ParsedStaticImport, StaticImport } from 'mlly'
import type { SourceMapInput } from 'rollup'
import type { Node } from 'estree-walker'

import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { parse } from 'acorn'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { findStaticImports, parseStaticImport } from 'mlly'
import { dirname } from 'pathe'

const functionsToExtract = new Set(['useAsyncData', 'useLazyAsyncData'])
const FUNCTIONS_RE = /\buse(?:Lazy)?AsyncData\b/

export interface ModuleOptions {
  enabled: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    configKey: 'boost',
    name: 'nuxt-rebundle',
  },
  defaults: nuxt => ({
    enabled: !nuxt.options.dev,
  }),
  setup(options) {
    if (!options.enabled) {
      return
    }

    const asyncDatas: Record<string, { code: string, map: SourceMapInput }> = {}

    addVitePlugin({
      name: 'async-data-chunks',
      enforce: 'post',
      resolveId(source) {
        if (source in asyncDatas) {
          return source
        }
      },
      load(id) {
        if (id in asyncDatas) {
          return asyncDatas[id]
        }
      },
      transform(code, id) {
        if (id.includes('nuxt/dist/app') || !FUNCTIONS_RE.test(code)) {
          return
        }

        let s: MagicString | undefined
        let imports: ParsedStaticImport[] | undefined

        walk(parse(code, {
          sourceType: 'module',
          ecmaVersion: 'latest',
          locations: true,
        }) as Node, {
          enter(node) {
            // Looking for useAsyncData and useLazyAsyncData calls
            if (node.type !== 'CallExpression' || node.callee.type !== 'Identifier' || !functionsToExtract.has(node.callee.name)) {
              return
            }

            // Find the function passed as the second argument
            const fetcherFn = node.arguments[1]
            if (!fetcherFn || (fetcherFn.type !== 'ArrowFunctionExpression' && fetcherFn.type !== 'FunctionExpression')) {
              return
            }

            s ||= new MagicString(code)

            /** Extract variables in scope we need to include */
            const variables = new Set<string>()
            const initialisers = new Set<string>()

            walk(fetcherFn.body, {
              enter(node, parent, key) {
                if (node.type === 'Identifier' && key !== 'property' && key !== 'key') {
                  variables.add(node.name)
                }
                else if (node.type === 'VariableDeclarator') {
                  extractInitialisations(node.id, initialisers)
                }
              },
            })

            for (const r of initialisers) {
              variables.delete(r)
            }
            const importsToInsert: StaticImport[] = []
            imports ||= findStaticImports(code).map(i => parseStaticImport(i))

            for (const r of variables) {
              const i = imports.find(i => i.defaultImport === r || i.namespacedImport === r || Object.values(i.namedImports || {}).includes(r))
              if (i) {
                variables.delete(r)
                importsToInsert.push(i)
              }
            }

            const imps = importsToInsert.map(i => i.code).join('\n')

            // preserve directory structure of purpose of resolving ids
            const key = `${dirname(id)}/async-data-chunk-${Math.random().toString(36).slice(2)}.js`

            const childNode = fetcherFn.body.type === 'BlockStatement' ? fetcherFn.body.body : [fetcherFn.body]
            const getIndex = (loc: { line: number, column: number }) => code.split('\n').slice(0, loc.line - 1).join('\n').length + loc.column

            const chunk = s.clone()
            const preface = `${imps}\nexport default async function (${[...variables].join(', ')}) { ${fetcherFn.body.type === 'BlockStatement' ? '' : `return `}`
            chunk.overwrite(0, getIndex(childNode[0]!.loc!.start), preface)
            chunk.overwrite(getIndex(childNode[childNode.length - 1]!.loc!.end) + 1, code.length, ` }`)

            asyncDatas[key] = {
              code: chunk.toString(),
              map: chunk.generateMap({ hires: true }),
            }

            s.overwrite(getIndex(fetcherFn.loc!.start), getIndex(fetcherFn.loc!.end) + 1, `() => import('${key}').then(r => (r.default || r)(${[...variables].join(', ')}))`)
          },
        })

        if (s?.hasChanged()) {
          return {
            code: s.toString(),
            map: s.generateMap({ hires: true }),
          }
        }
      },
    }, { server: false })
  },
})

function extractInitialisations(node: Node, initialisers: Set<string>) {
  if (node.type === 'Identifier') {
    initialisers.add(node.name)
  }
  if (node.type === 'ObjectPattern') {
    node.properties.forEach((p) => {
      if (p.type === 'Property') {
        extractInitialisations(p.key, initialisers)
      }
      if (p.type === 'RestElement') {
        extractInitialisations(p.argument, initialisers)
      }
    })
  }
  return initialisers
}
