#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const assets = new URL('../assets/answer-me-with-html-plus/', import.meta.url)
const renderer = fileURLToPath(new URL('vendor/am.mjs', assets))
const usage = 'Usage: node answer-me-with-html-plus.mjs render <draft.md|-> -o <page.html>\n       node answer-me-with-html-plus.mjs help [sequence|flow|state|steps|api|er|class|chart|format|...]\n       node answer-me-with-html-plus.mjs --version'
const htmlFence = '```'
const sourceTag = '<textarea id="am-source" hidden readonly aria-hidden="true">'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isAmount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function renderScenarios(json, index) {
  const spec = JSON.parse(json)
  if (!Array.isArray(spec?.cases) || !spec.cases.length) {
    throw new Error('scenarios requires a nonempty cases array')
  }

  for (const item of spec.cases) {
    if (!isText(item?.label) || !isText(item.recommendation) || !isText(item.reason)) {
      throw new Error('each case requires label, recommendation, and reason')
    }
    if (item.condition !== undefined && !isText(item.condition)) {
      throw new Error('condition must be nonempty text')
    }
    if (item.budget !== undefined && !isAmount(item.budget)) {
      throw new Error('budget must be a finite, nonnegative number')
    }
    if (item.metrics !== undefined && (!Array.isArray(item.metrics)
      || item.metrics.some(metric => !isText(metric?.label) || !isAmount(metric.value)))) {
      throw new Error('metrics must be an array of {label, value} with finite, nonnegative values')
    }
  }

  const scale = spec.cases.reduce((max, { budget, metrics }) =>
    (metrics || []).reduce((cap, metric) => Math.max(cap, metric.value), Math.max(max, budget ?? 0)), 0) || 1
  const amount = value => escapeHtml(value + (spec.unit ? ' ' + spec.unit : ''))
  const group = 'tds-plus-scenario-' + index
  const legend = escapeHtml(spec.legend || '选择场景')

  const panels = spec.cases.map((item, position) => {
    const id = group + '-' + position
    const metrics = item.metrics || []
    const bars = metrics.map(metric => {
      const width = metric.value / scale * 100
      const budget = item.budget === undefined ? '' :
        '<span class="tds-plus-budget-line" style="left:min(' + (item.budget / scale * 100) + '%, calc(100% - 2px))"></span>'
      const state = metric.highlight === true ? ' tds-plus-bar--highlight' : ''
      return '<div class="tds-plus-bar' + state + '"><div class="tds-plus-bar-label"><span>' + escapeHtml(metric.label)
        + '</span><strong>' + amount(metric.value) + '</strong></div><div class="tds-plus-track" aria-hidden="true">'
        + '<span class="tds-plus-fill" style="width:' + width + '%"></span>' + budget + '</div></div>'
    }).join('')
    const chart = bars ? '<div class="tds-plus-chart"><div class="tds-plus-chart-head"><strong>'
      + escapeHtml(spec.metricTitle || '方案结果') + '</strong>'
      + (item.budget === undefined ? '' : '<span class="tds-plus-budget">' + escapeHtml(spec.budgetLabel || '预算') + ' ' + amount(item.budget) + '</span>')
      + '</div>' + bars + '</div>' : ''

    return '<input class="tds-plus-radio" type="radio" id="' + id + '" name="' + group + '"'
      + (position === 0 ? ' checked' : '') + '><label class="tds-plus-tab" for="' + id + '" id="' + id + '-label">'
      + escapeHtml(item.label) + '</label><div class="tds-plus-result" role="group" aria-labelledby="' + id + '-label">'
      + '<div class="tds-plus-outcome"><strong>' + escapeHtml(item.recommendation) + '</strong><p>'
      + escapeHtml(item.reason) + '</p>' + (item.condition ? '<p class="tds-plus-condition">' + escapeHtml(item.condition) + '</p>' : '')
      + '</div>' + chart + '</div>'
  }).join('')

  return '<fieldset class="tds-plus-scenarios"><legend>' + legend + '</legend>' + panels + '</fieldset>'
}

function prepareDraft(source) {
  const output = []
  let fence = null
  let scenarioCount = 0

  for (const [index, line] of source.replace(/^\uFEFF/, '').split(/\r?\n/).entries()) {
    const token = line.match(/^[ ]{0,3}(`{3,}|~{3,})(.*)$/)
    if (!fence) {
      if (!token) {
        output.push(line)
        continue
      }
      fence = { mark: token[1], scenario: token[2].trim() === 'scenarios', start: index + 1, lines: [] }
      output.push(fence.scenario ? htmlFence + 'html' : line)
      continue
    }
    if (token?.[1].startsWith(fence.mark) && !token[2].trim()) {
      if (fence.scenario) {
        try {
          output.push(renderScenarios(fence.lines.join('\n'), ++scenarioCount))
          output.push(...fence.lines.slice(1).map(() => ''))
        } catch (error) {
          throw new Error('L' + fence.start + ' scenarios: ' + error.message, { cause: error })
        }
      }
      output.push(fence.scenario ? htmlFence : line)
      fence = null
    } else if (fence.scenario) {
      fence.lines.push(line)
    } else {
      output.push(line)
    }
  }
  if (fence?.scenario) throw new Error('L' + fence.start + ' scenarios: close the fenced block')
  return output.join('\n')
}

function runAm(args, options = {}) {
  const child = spawnSync(process.execPath, [renderer, ...args], { encoding: 'utf8', ...options })
  if (child.error) throw child.error
  if (child.status !== 0) {
    const error = new Error((child.stderr || child.stdout || 'Renderer exited unexpectedly').trim())
    error.exitCode = child.status ?? 1
    throw error
  }
  return child.stdout
}

function writeReport(file, html) {
  const folder = dirname(file)
  mkdirSync(folder, { recursive: true })
  const temp = mkdtempSync(join(folder, '.tds-html-plus-'))
  const staged = join(temp, 'report.html')
  try {
    writeFileSync(staged, html)
    renameSync(staged, file)
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
}

function render(input, output) {
  const source = readFileSync(input === '-' ? 0 : input, 'utf8')
  const draft = prepareDraft(source)
  const frontmatter = source.replace(/^\uFEFF/, '').match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)
  const layout = frontmatter?.[1].match(/^template:[ \t]*(doc|sheet)[ \t]*\r?$/m)?.[1] || 'doc'
  const scratch = mkdtempSync(join(tmpdir(), 'tds-html-plus-'))
  const page = join(scratch, 'report.html')
  const env = { ...process.env, AM_HOME: scratch, AM_NO_UPDATE_CHECK: '1' }
  try {
    runAm(['config', 'set', 'colophon', 'false'], { env })
    const summary = runAm(['render', '-', '--no-open', '--theme', 'shadcn', '--template', layout, '-o', page], {
      cwd: input === '-' ? process.cwd() : dirname(resolve(input)),
      input: draft,
      env,
    })

    const css = readFileSync(new URL('theme.css', assets), 'utf8')
    const original = readFileSync(page, 'utf8')
    const headEnd = original.indexOf('</head>')
    const sourceAt = original.lastIndexOf(sourceTag)
    const sourceStart = sourceAt + sourceTag.length
    const sourceEnd = original.indexOf('</textarea>', sourceStart)
    if (headEnd < 0 || sourceAt < headEnd || sourceEnd < 0) throw new Error('The bundled renderer returned an incomplete page')
    const html = original.slice(0, headEnd) + '<style id="tds-html-plus">\n' + css + '\n</style>\n'
      + original.slice(headEnd, sourceStart) + escapeHtml(source) + original.slice(sourceEnd)
    writeReport(output, html)
    console.log('✓ ' + output)
    for (const line of summary.trimEnd().split('\n').slice(1)) {
      if (!line.includes(scratch)) console.log(line)
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
}

const [, , command, input, outFlag, output, ...extras] = process.argv
try {
  if (command === 'help') {
    process.stdout.write(runAm(['help', ...(input ? [input] : [])]))
  } else if (command === '--version' || command === '-v') {
    process.stdout.write(runAm(['--version']))
  } else if (!command || command === '--help') {
    console.log(usage)
  } else if (command === 'render' && input && outFlag === '-o' && output && /\.html?$/i.test(output) && extras.length === 0) {
    if (input !== '-' && resolve(input) === resolve(output)) throw new Error('Use different files for the draft and output')
    render(input, resolve(output))
  } else {
    throw Object.assign(new Error(usage), { exitCode: 2 })
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = error.exitCode || 1
}
