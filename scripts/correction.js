import { TOILETS } from './data/toilets.js'
import {
  correctionFromValues,
  correctionViewModel,
  correctionsForToilet,
  valuesFromCorrection
} from './domain/corrections.js'
import { createCorrectionStore } from './services/correction-store.js'
import { element, replaceChildren } from './ui/dom.js'

export function setCategorySections(sections, selectedCategory) {
  sections.forEach((section) => {
    const visible = section.dataset.categorySection === selectedCategory
    section.hidden = !visible
    section.querySelectorAll('input, select, textarea').forEach((control) => {
      control.disabled = !visible
    })
  })
}

const readToiletId = (search) => new URLSearchParams(search).get('id')

function setFormValues(form, correction) {
  const values = valuesFromCorrection(correction)
  form.reset()

  Object.entries(values).forEach(([name, value]) => {
    if (form.elements[name]) form.elements[name].value = value
  })
}

function submissionCard(correction, { onEdit, onRemove }) {
  const view = correctionViewModel(correction)
  const article = element('article', {
    className: 'submission-card',
    attrs: { 'aria-labelledby': `submission-${view.id}` }
  })
  const top = element('div', { className: 'submission-card__top' })
  top.append(
    element('h3', { text: view.categoryLabel, attrs: { id: `submission-${view.id}` } }),
    element('span', {
      className: `review-state review-state--${view.status}`,
      text: view.statusLabel
    })
  )
  article.append(
    top,
    element('p', { className: 'submission-card__detail', text: view.detail }),
    element('p', { className: 'submission-card__note', text: `补充：${view.note}` }),
    element('time', {
      text: `最近保存：${new Date(view.updatedAt).toLocaleString('zh-CN')}`,
      attrs: { datetime: view.updatedAt }
    })
  )

  if (view.status === 'pending') {
    const actions = element('div', { className: 'submission-actions' })
    const edit = element('button', {
      className: 'button button--secondary',
      text: '修改',
      attrs: { type: 'button' }
    })
    const remove = element('button', {
      className: 'button button--danger',
      text: '撤回',
      attrs: { type: 'button' }
    })
    edit.addEventListener('click', () => onEdit(correction))
    remove.addEventListener('click', () => onRemove(correction))
    actions.append(edit, remove)
    article.append(actions)
  }

  return article
}

function initCorrectionPage() {
  const toiletId = readToiletId(document.location.search)
  const toilet = TOILETS.find(({ id }) => id === toiletId)
  const intro = document.querySelector('#correction-intro')
  const workspace = document.querySelector('#correction-workspace')
  const notFound = document.querySelector('#not-found')

  if (!toilet) {
    document.title = '演示地点未找到｜厕有引力'
    intro.hidden = true
    workspace.hidden = true
    notFound.hidden = false
    return
  }

  const form = document.querySelector('#correction-form')
  const sections = [...document.querySelectorAll('[data-category-section]')]
  const status = document.querySelector('#form-status')
  const saveButton = document.querySelector('#save-correction')
  const cancelButton = document.querySelector('#cancel-edit')
  const list = document.querySelector('#submission-list')
  const errors = document.querySelector('#submission-errors')
  const count = document.querySelector('#submission-count')
  const store = createCorrectionStore(window.localStorage, {
    toiletIds: TOILETS.map(({ id }) => id)
  })
  let editingId = null

  document.title = `帮忙纠正 ${toilet.name}｜厕有引力`
  document.querySelector('#toilet-name').textContent = toilet.name
  document.querySelector('#back-to-detail').href = `detail.html?id=${encodeURIComponent(toilet.id)}`

  const resetForm = () => {
    editingId = null
    form.reset()
    setCategorySections(sections, '')
    saveButton.textContent = '保存本地演示提交'
    cancelButton.hidden = true
  }

  const render = () => {
    const prepared = store.list()
    const submissions = correctionsForToilet(prepared.valid, toilet.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    count.textContent = `${submissions.length}条`

    if (prepared.invalid.length > 0) {
      errors.hidden = false
      errors.textContent = `${prepared.invalid.length}条本地纠错记录无法显示，其他记录不受影响。`
    } else {
      errors.hidden = true
      errors.textContent = ''
    }

    if (submissions.length === 0) {
      replaceChildren(list, [element('p', {
        className: 'empty-submissions',
        text: '还没有提交过纠错内容。选一项问题开始即可。'
      })])
      return
    }

    replaceChildren(list, submissions.map((correction) => submissionCard(correction, {
      onEdit(selected) {
        editingId = selected.id
        setFormValues(form, selected)
        setCategorySections(sections, selected.category)
        saveButton.textContent = '保存修改'
        cancelButton.hidden = false
        status.textContent = '正在修改这条本地模拟待审核内容。'
        form.querySelector(`[name="category"][value="${selected.category}"]`).focus()
        form.scrollIntoView({ behavior: 'smooth', block: 'start' })
      },
      onRemove(selected) {
        if (!window.confirm('撤回这条待审核内容？')) return
        try {
          store.remove(selected.id)
          if (editingId === selected.id) resetForm()
          status.textContent = '这条内容已撤回。'
          render()
        } catch (error) {
          status.textContent = `没有撤回：${error.message}`
        }
      }
    })))
  }

  form.addEventListener('change', (event) => {
    if (event.target.name === 'category') {
      setCategorySections(sections, event.target.value)
    }
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const existing = editingId
      ? store.list().valid.find(({ id }) => id === editingId) ?? null
      : null

    try {
      const record = correctionFromValues(
        Object.fromEntries(new FormData(form)),
        toilet.id,
        { existing }
      )
      store.upsert(record)
      resetForm()
      status.textContent = existing
        ? '修改已保存，仍是本地模拟待审核状态。'
        : '已保存到当前浏览器，并模拟进入待审核状态；开发者看不到这条内容。'
      render()
    } catch (error) {
      status.textContent = `没有保存：${error.message}`
    }
  })

  cancelButton.addEventListener('click', () => {
    resetForm()
    status.textContent = '已取消修改。'
  })

  setCategorySections(sections, '')
  render()
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCorrectionPage)
}
