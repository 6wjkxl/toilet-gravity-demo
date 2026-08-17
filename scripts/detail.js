import { TOILETS } from './data/toilets.js'
import { allReviewsFor, rankToilets } from './domain/ranking.js'
import { createReviewStore } from './services/review-store.js'
import { element } from './ui/dom.js'

const STATUS = {
  open: '开放中',
  uncertain: '待确认',
  closed: '暂时关闭'
}

const FACILITIES = {
  accessible: '无障碍设施',
  family: '亲子设施',
  seated: '坐便位',
  'toilet-paper': '提供厕纸',
  'hand-wash': '可洗手'
}

export function findToiletById(id) {
  return TOILETS.find((toilet) => toilet.id === id) ?? null
}

export function readToiletId(search) {
  return new URLSearchParams(search).get('id')
}

export function reviewFromValues(values, toiletId, {
  existing = null,
  now = new Date(),
  idFactory = () => crypto.randomUUID()
} = {}) {
  const timestamp = now.toISOString()

  return {
    id: existing?.id ?? `local-${idFactory()}`,
    toiletId,
    overallRating: Number(values.overallRating),
    cleanlinessRating: Number(values.cleanlinessRating),
    findabilityRating: Number(values.findabilityRating),
    facilityRating: Number(values.facilityRating),
    content: String(values.content ?? '').trim(),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    source: 'local-demo'
  }
}

function appendFact(list, label, value) {
  list.append(
    element('dt', { text: label }),
    element('dd', { text: value })
  )
}

function createNotFoundView() {
  const card = element('section', { className: 'not-found-card' })
  card.append(
    element('p', { className: 'eyebrow', text: '演示链接未找到' }),
    element('h1', { text: '没有找到这个演示地点' }),
    element('p', { text: '链接可能不完整，或演示数据已经更新。' }),
    element('a', {
      className: 'button button--primary',
      text: '返回附近厕所',
      attrs: { href: 'index.html#nearby' }
    })
  )
  return card
}

function createDetailView(toilet) {
  const fragment = document.createDocumentFragment()
  const ratingCount = toilet.seedReviews.length
  const rating = ratingCount
    ? toilet.seedReviews.reduce((sum, review) => sum + review.overallRating, 0) / ratingCount
    : null

  const status = element('p', {
    className: `status status--${toilet.status}`,
    text: `${STATUS[toilet.status] ?? '状态未知'} · 演示数据`
  })
  const title = element('h1', { className: 'detail-title', text: toilet.name })
  const ratingLine = element('p', {
    className: 'detail-rating',
    text: rating === null
      ? '暂无演示评价'
      : `★ ${rating.toFixed(1)} · ${ratingCount} 条演示评价`
  })

  const entrance = element('section', { className: 'entrance-card' })
  entrance.append(
    element('p', { className: 'eyebrow', text: '怎么找到入口' }),
    element('h2', { text: toilet.entranceDescription })
  )
  const rankBadge = element('aside', {
    className: 'rank-badge',
    attrs: { id: 'detail-rank', 'aria-live': 'polite' }
  })

  const factsCard = element('section', { className: 'facts-card' })
  const facts = element('dl', { className: 'facts' })
  appendFact(facts, '楼层', toilet.floor)
  appendFact(facts, '开放时间', toilet.openingHours)
  appendFact(facts, '演示地址', toilet.address)
  appendFact(facts, '数据来源', toilet.dataSource)
  factsCard.append(element('h2', { text: '地点信息' }), facts)

  const facilitiesTitle = element('h2', { text: '提供的设施' })
  const facilities = element('ul', { className: 'facility-list' })
  facilities.replaceChildren(...toilet.facilities.map((value) => element('li', {
    text: FACILITIES[value] ?? value
  })))

  const route = element('section', {
    className: 'demo-route-card',
    attrs: { id: 'demo-route', 'aria-labelledby': 'demo-route-title' }
  })
  route.append(
    element('p', { className: 'eyebrow', text: '路线预览' }),
    element('h2', { text: '查看演示路线', attrs: { id: 'demo-route-title' } }),
    element('p', { text: '坐标和道路均未核实，当前只展示入口说明，不提供真实导航。' }),
    element('a', {
      className: 'button button--primary',
      text: '返回附近列表',
      attrs: { href: 'index.html#nearby' }
    })
  )

  const demoNotice = element('p', {
    className: 'detail-demo-notice',
    text: '这是演示地点，不是真实公共厕所数据。'
  })

  const correction = element('section', { className: 'correction-callout' })
  correction.append(
    element('div', { className: 'correction-callout__copy' }),
    element('a', {
      className: 'button button--secondary',
      text: '信息有误？帮忙纠正',
      attrs: { href: `correction.html?id=${encodeURIComponent(toilet.id)}` }
    })
  )
  correction.firstElementChild.append(
    element('p', { className: 'eyebrow', text: '只保存在此浏览器' }),
    element('h2', { text: '让资料离正确更近一点' }),
    element('p', { text: '提交后只会在此浏览器中模拟进入待审核，开发者看不到，也不会影响评分和榜单。' })
  )

  fragment.append(
    status,
    title,
    ratingLine,
    entrance,
    rankBadge,
    factsCard,
    facilitiesTitle,
    facilities,
    route,
    correction,
    demoNotice
  )
  return fragment
}

function renderRankBadge(toilet, store) {
  const badge = document.querySelector('#detail-rank')
  const ranked = rankToilets(
    TOILETS,
    allReviewsFor(TOILETS, store.list()),
    new Date()
  )
  const index = ranked.findIndex(({ id }) => id === toilet.id)

  if (index < 0) {
    badge.hidden = true
    badge.replaceChildren()
    return
  }

  badge.hidden = false
  badge.replaceChildren(
    element('strong', { text: `沙市厕榜第 ${index + 1} 名` }),
    element('p', { text: ranked[index].rankReason })
  )
}

function setReviewFormValues(form, review) {
  for (const name of [
    'overallRating',
    'cleanlinessRating',
    'findabilityRating',
    'facilityRating',
    'content'
  ]) {
    form.elements[name].value = review[name]
  }
}

function createReviewItem(review, { onEdit, onDelete } = {}) {
  const item = element('article', {
    className: `review-card${review.source === 'local-demo' ? ' review-card--local' : ''}`
  })
  const sourceText = review.source === 'local-demo' ? '你的本地评价' : '种子演示评价'
  const heading = element('div', { className: 'review-card-heading' })
  heading.append(
    element('strong', { text: `★ ${review.overallRating} · ${sourceText}` }),
    element('small', { text: new Date(review.updatedAt).toLocaleDateString('zh-CN') })
  )
  item.append(
    heading,
    element('p', {
      className: 'review-content',
      text: review.content || '这条演示评价没有填写短评。'
    }),
    element('p', {
      className: 'review-scores',
      text: `卫生 ${review.cleanlinessRating} · 好找 ${review.findabilityRating} · 设施 ${review.facilityRating}`
    })
  )

  if (review.source === 'local-demo') {
    const actions = element('div', { className: 'review-actions' })
    const editButton = element('button', {
      className: 'button button--secondary',
      text: '修改',
      attrs: { type: 'button' }
    })
    const deleteButton = element('button', {
      className: 'button button--danger',
      text: '删除',
      attrs: { type: 'button' }
    })
    editButton.addEventListener('click', () => onEdit(review))
    deleteButton.addEventListener('click', () => onDelete(review))
    actions.append(editButton, deleteButton)
    item.append(actions)
  }

  return item
}

function setupReviews(toilet, store) {
  const form = document.querySelector('#review-form')
  const list = document.querySelector('#review-list')
  const status = document.querySelector('#review-status')
  const saveButton = document.querySelector('#save-review')
  const cancelButton = document.querySelector('#cancel-edit')
  let editingId = null

  const resetEditing = () => {
    editingId = null
    form.reset()
    saveButton.textContent = '保存到此浏览器'
    cancelButton.hidden = true
  }

  const renderReviews = () => {
    const localReviews = store.list().filter((review) => review.toiletId === toilet.id)
    const reviews = [...localReviews, ...toilet.seedReviews]

    list.replaceChildren(...reviews.map((review) => createReviewItem(review, {
      onEdit(selected) {
        editingId = selected.id
        setReviewFormValues(form, selected)
        saveButton.textContent = '保存修改'
        cancelButton.hidden = false
        status.textContent = '正在修改这条本地评价。'
        form.elements.overallRating.focus()
      },
      onDelete(selected) {
        if (!window.confirm('删除这条本地演示评价？')) return

        try {
          store.remove(selected.id)
          if (editingId === selected.id) resetEditing()
          status.textContent = '本地评价已删除。'
          renderRankBadge(toilet, store)
          renderReviews()
        } catch (error) {
          status.textContent = `评价没有删除：${error.message}`
        }
      }
    })))
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(form))
    const existing = editingId
      ? store.list().find((review) => review.id === editingId) ?? null
      : null

    try {
      store.upsert(reviewFromValues(values, toilet.id, { existing }))
      resetEditing()
      status.textContent = existing
        ? '修改已保存到此浏览器。'
        : '评价已保存到此浏览器。'
      renderRankBadge(toilet, store)
      renderReviews()
    } catch (error) {
      status.textContent = `评价没有保存：${error.message}`
    }
  })

  cancelButton.addEventListener('click', () => {
    resetEditing()
    status.textContent = '已取消修改。'
  })

  renderReviews()
}

function initDetailPage() {
  const root = document.querySelector('#detail-root')
  const reviewPanel = document.querySelector('.review-panel')
  const toilet = findToiletById(readToiletId(document.location.search))

  if (!toilet) {
    document.title = '演示地点未找到｜厕有引力'
    reviewPanel.hidden = true
    root.replaceChildren(createNotFoundView())
    return
  }

  reviewPanel.hidden = false
  const store = createReviewStore(window.localStorage)
  document.title = `${toilet.name}｜厕有引力`
  root.replaceChildren(createDetailView(toilet))
  renderRankBadge(toilet, store)
  setupReviews(toilet, store)
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initDetailPage)
}
